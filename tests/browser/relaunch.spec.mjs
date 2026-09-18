import { test, expect } from '@playwright/test';
import { defaults } from '../../lib/content.js';
const slugs=['','ueber-mich','angebote','zyklusberatung','praeventionskurse','praenatal','postnatal','individuelles-yoga','red-circle','offene-stunden','termine','kontakt','agb'];
test.beforeEach(async({page})=>{
 await page.route('**/api/**',route=>{
  const path=new URL(route.request().url()).pathname;
  const data=path==='/api/content'?defaults:path==='/api/courses'?[]:{message:'Test-only response'};
  return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)});
 });
});
for (const width of [1440,390]) test('editorial routes have one H1 and no overflow at '+width+'px',async({page})=>{
 test.setTimeout(90000);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setViewportSize({width,height:950});
 for(const slug of slugs){
  const response=await page.goto('/'+(slug?slug+'/':''),{waitUntil:'domcontentloaded'});expect(response.status()).toBe(200);
  await expect(page.locator('main h1')).toHaveCount(1);await expect(page.locator('main h1')).toBeVisible();
  await page.evaluate(()=>document.fonts.ready);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1),slug+' at '+width+'px').toBe(true);
 }
 await page.goto('/');await page.screenshot({path:'test-results/relaunch-home-'+width+'.png',fullPage:true});
 expect(errors).toEqual([]);
});
test('split offerings menu supports keyboard, Escape, mobile expansion and route changes',async({page})=>{
 await page.goto('/');const toggle=page.getByRole('button',{name:'Angebotsmenü öffnen'});
 const centres=await page.locator('.offer-nav-heading').evaluate(el=>{const a=el.querySelector('a').getBoundingClientRect(),b=el.querySelector('svg').getBoundingClientRect();return Math.abs(a.y+a.height/2-b.y-b.height/2);});expect(centres).toBeLessThan(2);
 await toggle.focus();await page.keyboard.press('Enter');await expect(toggle).toHaveAttribute('aria-expanded','true');
 await page.keyboard.press('Tab');await expect(page.locator('#offer-menu a').first()).toBeFocused();
 await page.keyboard.press('Escape');await expect(toggle).toHaveAttribute('aria-expanded','false');await expect(toggle).toBeFocused();
 await page.locator('.offer-nav-heading a').click();await expect(page).toHaveURL(/\/angebote\/$/);await expect(page.locator('h1')).toHaveText('Wie möchtest du mit mir arbeiten?');
 await page.setViewportSize({width:390,height:844});await page.getByRole('button',{name:'Menü öffnen oder schließen'}).click();await toggle.click();
 await expect(page.locator('#offer-menu a').first().locator('span')).toBeHidden();
 await page.locator('#offer-menu').getByRole('link',{name:'Zyklusberatung'}).click();await expect(page.locator('h1')).toHaveText('FIND YOUR CYCLE');
 await expect(page.locator('#main-navigation')).not.toHaveClass(/show/);
});
test('English routes retain context, translate editorial content, forms and legal links',async({page})=>{
 await page.goto('/zyklusberatung/');await page.locator('.language-switch').getByRole('link',{name:'EN',exact:true}).click();
 await expect(page).toHaveURL(/\/en\/zyklusberatung\/$/);await expect(page.locator('html')).toHaveAttribute('lang','en');
 await expect(page.locator('.language-notice')).toHaveCount(0);
 await expect(page.getByRole('heading',{name:'Your body is not your enemy.'})).toBeVisible();
 await expect(page.getByText('What happens during the free introductory call?')).toBeVisible();
 await expect(page.locator('.offer-nav-heading')).toContainText('Offerings');await expect(page.locator('h1')).toHaveText('FIND YOUR CYCLE');
 await page.goto('/en/');await expect(page.locator('h1')).toContainText('Your body.');
 await expect(page.getByRole('heading',{name:'What do you need right now?'})).toBeVisible();
 await page.goto('/en/kontakt/');await expect(page.getByRole('option',{name:'Corporate yoga'})).toHaveAttribute('value','Firmenyoga');
 await expect(page.getByRole('heading',{name:'Cycle consultation',exact:true})).toBeVisible();
 await page.locator('.footer-bottom').getByRole('link',{name:'Privacy',exact:true}).click();await expect(page).toHaveURL(/\/en\/datenschutz\/$/);
 await expect(page.getByRole('heading',{name:'Personal data'})).toBeVisible();
});
test('dates are shared, ordered, capped and expired records do not display',async({page})=>{
 const event=(id,start,published=true)=>({id,title:'Event '+id,category:'red-circle',published,start,location:'Test room',duration:'2 Stunden',price:45,bookingUrl:''});
 const events=[event('fourth','2099-12-04T17:00:00+01:00'),event('second','2099-12-02T17:00:00+01:00'),event('first','2099-12-01T17:00:00+01:00'),event('third','2099-12-03T17:00:00+01:00'),event('old','2000-01-01T17:00:00+01:00'),event('draft','2099-11-01T17:00:00+01:00',false)];
 await page.route('**/api/content',route=>route.fulfill({json:{...defaults,eventsJson:JSON.stringify(events)}}));
 await page.goto('/');await expect(page.locator('.event-row')).toHaveCount(3);await expect(page.locator('.event-row h3').first()).toHaveText('Event first');
 await page.goto('/termine/');await expect(page.locator('.event-row')).toHaveCount(4);await expect(page.getByText('Event old')).toHaveCount(0);
 await expect(page.getByRole('link',{name:'Platz buchen'})).toHaveCount(0);
});
test('contact preserves input on errors and does not load Calendly before a click',async({page})=>{
 const external=[];page.on('request',r=>{if(r.url().includes('calendly.com'))external.push(r.url());});
 await page.route('**/api/content',route=>route.fulfill({json:{...defaults,calendlyCycle:'https://calendly.com/test-only/introduction'}}));
 await page.route('**/api/contact',route=>route.fulfill({status:503,json:{message:'Unavailable'}}));
 await page.goto('/kontakt/?thema=Firmenyoga#nachricht');await expect(page.getByLabel('Thema',{exact:true})).toHaveValue('Firmenyoga');
 await page.getByLabel('Name',{exact:true}).fill('Test');await page.getByLabel('E-Mail',{exact:true}).fill('test@example.com');await page.getByLabel('Nachricht',{exact:true}).fill('Meine Frage');await page.getByRole('checkbox').check();
 await page.getByRole('button',{name:'Nachricht senden'}).click();await expect(page.locator('.contact-form [role=status]')).toContainText('nicht versendet');await expect(page.getByLabel('Nachricht',{exact:true})).toHaveValue('Meine Frage');
 expect(external).toEqual([]);await expect(page.getByRole('link',{name:'Kennenlerngespräch buchen'})).toHaveAttribute('href','https://calendly.com/test-only/introduction');
});

test('Cloudflare serves navigation payloads and fonts while preserving legacy redirects',async({request})=>{
 for(const file of ['index.txt','__next._tree.txt','__next._full.txt']){
  const response=await request.get('/angebote/'+file);expect(response.status()).toBe(200);expect(response.url()).toContain('/angebote/'+file);expect(await response.text()).not.toContain('<!DOCTYPE html>');
 }
 const font=await request.get('/fonts/fraunces.woff2');expect(font.status()).toBe(200);expect((await font.body()).subarray(0,4).toString()).toBe('wOF2');
 const old=await request.get('/angebote/legacy-course',{maxRedirects:0});expect(old.status()).toBe(302);expect(old.headers().location).toContain('/angebote/?slug=legacy-course');
});

test('legacy course links and the editorial overview can be switched without a reload',async({page})=>{
 const legacy={id:'legacy-test',label:'Bestehender Kurs',type:'link',href:'/angebote/?slug=legacy-course',visible:true,newTab:false,children:[]};
 await page.route('**/api/content',r=>r.fulfill({json:{...defaults,navigation:[...defaults.navigation,legacy]}}));
 await page.route('**/api/courses/legacy-course',r=>r.fulfill({json:{id:99,slug:'legacy-course',title:'Bestehender Testkurs',teaser:'Test-only course',duration:'60 Minuten',price:25,bookingUrl:''}}));
 await page.goto('/angebote/');await page.getByRole('link',{name:'Bestehender Kurs',exact:true}).click();
 await expect(page.locator('h1')).toHaveText('Bestehender Testkurs');
 await page.locator('.offer-nav-heading a').click();await expect(page.locator('h1')).toHaveText('Wie möchtest du mit mir arbeiten?');
});
test('all English pages render translated copy without horizontal overflow',async({page})=>{
 test.setTimeout(180000);
 const untranslated=/\b(brauchst|Körper|Kennenlernen|Datenschutz|Präventionskurse|Geschäftsbedingungen|Schwangerschaft|Frauengesundheit)\b/;
 for(const width of [1440,390]){
  await page.setViewportSize({width,height:950});
  for(const slug of [...slugs,'impressum','datenschutz']){
   await page.goto('/en/'+(slug?slug+'/':''),{waitUntil:'domcontentloaded'});
   await expect(page.locator('main h1')).toHaveCount(1);
   await page.evaluate(()=>document.fonts.ready);
   expect(await page.locator('main').innerText(),slug).not.toMatch(untranslated);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),slug+' at '+width).toBe(true);
  }
 }
});
