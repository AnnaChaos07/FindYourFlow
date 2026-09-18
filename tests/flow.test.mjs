import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateCollection, validateContent, publicContent } from '../lib/cms.js';
import { defaults } from '../lib/content.js';
import { upcomingEvents } from '../lib/flow-data.js';
import { validateContact } from '../lib/validation.js';
import { fixtures } from '../lib/fixtures/flow.js';
const event = { id:'event-one',published:true,category:'praenatal',title:'Test course',start:'2030-10-06T16:30:00+02:00',end:'2030-10-06T17:30:00+02:00',location:'Berlin',duration:'8 Termine',price:165,bookingUrl:'' };
test('events sort chronologically, exclude drafts and past events, filter categories and cap homepage results',()=>{
 const events=[{...event,id:'later',start:'2030-11-06T15:30:00+01:00',end:''},event,{...event,id:'past',start:'2020-10-06T16:30:00+02:00',end:''},{...event,id:'draft',published:false},{...event,id:'other',category:'red-circle'},{...event,id:'invalid',start:'invalid'}];
 assert.deepEqual(upcomingEvents(events,{now:new Date('2030-01-01'),category:'praenatal',limit:1}).map(e=>e.id),['event-one']);
 assert.equal(upcomingEvents(events,{now:new Date('2030-01-01'),limit:3}).length,3);
});
test('CMS rejects development fixtures, unsafe URLs, duplicate IDs, invalid dates and negative prices',()=>{
 assert.throws(()=>validateCollection(JSON.stringify(fixtures.eventsJson),'events'));
 for(const change of [{bookingUrl:'javascript:alert(1)'},{bookingUrl:'//evil.example'},{start:'06.10.'},{end:'2029-01-01T00:00:00Z'},{price:-1},{published:'yes'}]) assert.throws(()=>validateCollection(JSON.stringify([{...event,...change}]),'events'));
 assert.throws(()=>validateCollection(JSON.stringify([event,event]),'events'));
 assert.equal(JSON.parse(validateCollection(JSON.stringify([event]),'events'))[0].start,event.start);
});
test('unpublished collection records never reach the public API content',()=>{
 const data=publicContent({...defaults,eventsJson:JSON.stringify([event,{...event,id:'secret',published:false}]),testimonialsJson:JSON.stringify([{id:'private',published:false,quote:'private quote'}])});
 assert.equal(JSON.parse(data.eventsJson).length,1);assert.equal(data.testimonialsJson,'[]');
 assert.equal(defaults.eventsJson,'[]');assert.equal(defaults.testimonialsJson,'[]');assert.equal(defaults.classesJson,'[]');
});
test('Calendly configuration is optional and restricted to the actual service',()=>{
 assert.doesNotThrow(()=>validateContent({calendlyCycle:'https://calendly.com/anna/kennenlernen'}));
 for(const url of ['https://calendly.com.evil.example/','/relative','javascript:alert(1)']) assert.throws(()=>validateContent({calendlyCycle:url}));
});
test('contact requires explicit privacy consent',()=>{
 const message={name:'Test',email:'test@example.com',subject:'Yoga',message:'Hello'};
 for(const privacyConsent of [undefined,false,'true'])assert.throws(()=>validateContact({...message,privacyConsent}));
 assert.equal(validateContact({...message,privacyConsent:true}).name,'Test');
});
test('English editorial overrides and event translations survive CMS validation',()=>{
 assert.equal(Object.fromEntries(validateContent({aboutTextEn:'English editorial text'})).aboutTextEn,'English editorial text');
 const translated={...event,titleEn:'Prenatal yoga',durationEn:'8 sessions',themeEn:'A moment for yourself'};
 const saved=JSON.parse(validateCollection(JSON.stringify([translated]),'events'))[0];
 assert.equal(saved.titleEn,translated.titleEn);assert.equal(saved.durationEn,translated.durationEn);
 assert.throws(()=>validateCollection(JSON.stringify([{...event,titleEn:'x'.repeat(201)}]),'events'));
});
