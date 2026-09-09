-- Explicit setup only. Public GET endpoints never recreate deleted courses.
INSERT INTO course(slug, title, teaser, duration, price) VALUES
 ('praeventionskurse', 'Präventionskurse', 'Gesund bewegen, Stress reduzieren und neue Kraft sammeln.', '8 Termine à 75 Minuten', 129.00),
 ('zyklusberatung', 'Zyklusberatung', 'Deinen Zyklus verstehen und Ressourcen nutzen.', 'Einzeltermin · 90 Minuten', 89.00),
 ('frauenkreise', 'Frauenkreise', 'Ein Raum für Austausch, Rituale und Verbindung.', 'Ein Abend · 120 Minuten', 35.00),
 ('mama-baby-kurs', 'Mama-Baby-Kurs', 'Sanfte Yogapraxis mit deinem Baby.', '6 Termine à 60 Minuten', 99.00),
 ('offene-stunden', 'Offene Stunden', 'Flexibel teilnehmen und Energie tanken.', 'Einzelstunde · 75 Minuten', 18.00)
ON CONFLICT (slug) DO NOTHING;
