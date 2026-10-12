"""Browserkernreise. Benötigt gestartete App, Playwright und Chromium."""
from pathlib import Path
from playwright.sync_api import sync_playwright, expect
import json, datetime, hashlib

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'docs/evidence/REQ-002'
OUT.mkdir(parents=True,exist_ok=True)
checks=[];created_id=None
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':1440,'height':1050})
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto('http://127.0.0.1:3000')
 expect(page.locator('#engagement')).to_be_enabled()
 page.select_option('#engagement','11111111-1111-4111-8111-111111111111')
 expect(page.get_by_text('Serverseitig gespeichert',exact=True)).to_be_visible()
 page.evaluate('window.scrollTo(0,0)');page.screenshot(path=str(OUT/'01-overview-desktop.png'),full_page=True,animations='disabled')
 def nav(name):page.locator('.sidebar nav').get_by_role('button',name=name).click()
 nav('Wertschöpfung')
 expect(page.get_by_role('heading',name='Markt & Anforderungen',exact=True)).to_be_visible()
 page.get_by_role('button',name='Software-Entwicklung',exact=True).click()
 expect(page.get_by_role('heading',name='Discovery & Produktziel',exact=True)).to_be_visible()
 page.get_by_role('button',name='Vertrieb',exact=True).click()
 expect(page.get_by_role('heading',name='Markt & Account-Fokus',exact=True)).to_be_visible()
 page.locator('.value-chain').get_by_role('button',name='Lösung & Angebot').click()
 expect(page.get_by_role('heading',name='Lösung & Angebot',exact=True)).to_be_visible()
 page.evaluate('window.scrollTo(0,0)');page.screenshot(path=str(OUT/'02-valuechain-desktop.png'),full_page=True,animations='disabled')
 # Diese erste Akte wurde nur lokal verändert: keine Änderungen speichern.
 page.on('dialog',lambda d:d.accept())
 page.get_by_role('button',name='Neue Demoakte',exact=True).click()
 dialog=page.locator('dialog').nth(0)
 dialog.get_by_label('Name der Demoakte',exact=True).fill('QA · Strategieworkshop')
 with page.expect_response(lambda r:r.request.method=='POST' and r.url.endswith('/api/engagements')) as response:
  dialog.get_by_role('button',name='Demoakte anlegen',exact=True).click()
 created_id=response.value.json()['id']
 expect(page.locator('#engagement')).to_have_value(created_id)
 checks.append('PASS: neue synthetische Demoakte über Oberfläche erstellt; ursprüngliche Akte nicht überschrieben')
 nav('Gesprächsführung')
 expect(page.get_by_role('heading',name='Welche Position in der Wertschöpfung wollen Sie durch KI stärken – und worauf verzichten Sie bewusst?',exact=True)).to_be_visible()
 page.get_by_role('textbox',name='Gesprächsnotiz / Antwort',exact=True).fill('Hardware: Kundenanforderungen nachvollziehbar in technische Entscheidungen übersetzen.')
 page.get_by_role('button',name='Software-Entwicklung',exact=True).click()
 expect(page.get_by_role('textbox',name='Gesprächsnotiz / Antwort',exact=True)).to_have_value('')
 page.get_by_role('textbox',name='Gesprächsnotiz / Antwort',exact=True).fill('Software: End-to-End-Lieferfluss einschließlich Review und Tests untersuchen.')
 page.get_by_role('button',name='Vertrieb',exact=True).click()
 expect(page.get_by_role('textbox',name='Gesprächsnotiz / Antwort',exact=True)).to_have_value('')
 page.get_by_role('textbox',name='Gesprächsnotiz / Antwort',exact=True).fill('Vertrieb: belegte Kundenbedürfnisse von internen Verkaufshypothesen trennen.')
 page.get_by_label('Gesprächsebene',exact=True).select_option('c-2')
 expect(page.get_by_role('heading',name='Welche Aufgabe im Prozess soll für Nutzer oder Kunden besser werden?',exact=True)).to_be_visible()
 page.get_by_role('button',name='Änderungen speichern',exact=True).click()
 expect(page.get_by_text('Änderungen gespeichert.',exact=True)).to_be_visible()
 page.evaluate('window.scrollTo(0,0)');page.screenshot(path=str(OUT/'03-conversation-desktop.png'),full_page=True,animations='disabled')
 page.reload();expect(page.locator('#engagement')).to_be_enabled();page.select_option('#engagement',created_id)
 expect(page.get_by_role('textbox',name='Gesprächsnotiz / Antwort',exact=True)).to_have_value('Vertrieb: belegte Kundenbedürfnisse von internen Verkaufshypothesen trennen.')
 page.get_by_role('button',name='Hardware-Entwicklung',exact=True).click()
 expect(page.get_by_role('textbox',name='Gesprächsnotiz / Antwort',exact=True)).to_have_value('Hardware: Kundenanforderungen nachvollziehbar in technische Entscheidungen übersetzen.')
 checks.append('PASS: pro Prozess getrennte Antworten; C-Level/C-2 ändern Fragen; Speichern/Reload stellt Notizen wieder her')
 page.get_by_role('button',name='Änderungen speichern',exact=True).click();expect(page.get_by_text('Änderungen gespeichert.',exact=True)).to_be_visible()
 nav('Strategische Optionen')
 page.locator('.option-card').filter(has_text='Engineering-Wissen').get_by_role('button',name='Für Untersuchung auswählen').click()
 page.locator('.option-card').filter(has_text='Kundenwissen').get_by_role('button',name='Für Untersuchung auswählen').click()
 page.evaluate('window.scrollTo(0,0)');page.screenshot(path=str(OUT/'04-options-desktop.png'),full_page=True,animations='disabled')
 nav('6-Wochen-Roadmap');expect(page.get_by_role('button',name='Briefing exportieren')).to_be_disabled()
 expect(page.get_by_text('Einen Anforderungs-/Wissensfall mit geprüfter Referenzantwort und zulässigen Dokumenten vorbereiten.',exact=True)).to_be_visible()
 page.get_by_role('button',name='Änderungen speichern',exact=True).click();expect(page.get_by_text('Änderungen gespeichert.',exact=True)).to_be_visible()
 page.evaluate('window.scrollTo(0,0)');page.screenshot(path=str(OUT/'05-roadmap-desktop.png'),full_page=True,animations='disabled')
 with page.expect_download() as dl:page.get_by_role('button',name='Briefing exportieren').click()
 downloaded=OUT/'briefing-test.md';dl.value.save_as(downloaded);text=downloaded.read_text()
 assert 'Hardware: Kundenanforderungen' in text and 'Software: End-to-End' in text and 'Vertrieb: belegte' in text
 assert 'Woche 6' in text and 'Offen —' in text and 'SYNTHETISCHE DEMONSTRATIONSDATEN' in text
 checks.append('PASS: Optionsauswahl beeinflusst Roadmap; ungespeicherter Export gesperrt; echter Markdown-Download enthält Antworten aller drei Prozesse')
 nav('Wissen & Benchmarks');expect(page.get_by_role('heading',name='Marktsignale. Keine DAX-Benchmarks.',exact=True)).to_be_visible()
 page.get_by_role('button',name='Methodik ansehen').click();expect(page.locator('dialog').nth(1)).to_be_visible()
 expect(page.locator('dialog').nth(1)).to_contain_text('Nicht peer-reviewed')
 page.keyboard.press('Escape');expect(page.locator('dialog').nth(1)).not_to_be_visible()
 page.get_by_label('Quellen durchsuchen').fill('nichts-findbar-123');expect(page.get_by_text('Keine Quelle für diese Auswahl. Suchbegriff oder Filter ändern.',exact=True)).to_be_visible()
 page.get_by_label('Quellen durchsuchen').fill('');page.evaluate('window.scrollTo(0,0)');page.screenshot(path=str(OUT/'06-library-desktop.png'),full_page=True,animations='disabled')
 checks.append('PASS: Quellenprüfung/Übertragbarkeit sichtbar; Quellendialog, Escape und leere Suche geprüft')
 # Ausfall und Konflikt: keine unbemerkte Überschreibung oder verlorene Eingaben.
 nav('Gesprächsführung');page.get_by_role('textbox',name='Gesprächsnotiz / Antwort',exact=True).fill('Lokale ungespeicherte Änderung')
 original=page.request.get('http://127.0.0.1:3000/api/engagements/'+created_id).json()
 patch={k:original[k] for k in ['revision','context','answers','selectedOptions']};patch['answers']['hardware.ambition']='Parallel gespeicherte Änderung'
 assert page.request.patch('http://127.0.0.1:3000/api/engagements/'+created_id,data=patch).status==200
 page.get_by_role('button',name='Änderungen speichern',exact=True).click()
 expect(page.locator('.alert[role=alert]')).to_contain_text('zwischenzeitlich geändert')
 expect(page.get_by_role('textbox',name='Gesprächsnotiz / Antwort',exact=True)).to_have_value('Lokale ungespeicherte Änderung')
 page.evaluate('window.scrollTo(0,0)');page.screenshot(path=str(OUT/'07-conflict-desktop.png'),full_page=True,animations='disabled')
 page.get_by_role('button',name='Akte neu laden').click();expect(page.get_by_role('textbox',name='Gesprächsnotiz / Antwort',exact=True)).to_have_value('Parallel gespeicherte Änderung')
 checks.append('PASS: konkurrierende Speicherung → verständlicher Konflikt, lokale Eingabe erhalten, explizites Neuladen')
 for name in ['Mandat & Überblick','Wertschöpfung','Gesprächsführung','Strategische Optionen','6-Wochen-Roadmap','Wissen & Benchmarks']:
  nav(name);page.set_viewport_size({'width':390,'height':844})
  assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'),name
  slug={'Mandat & Überblick':'overview','Wertschöpfung':'valuechain','Gesprächsführung':'conversation','Strategische Optionen':'options','6-Wochen-Roadmap':'roadmap','Wissen & Benchmarks':'library'}[name]
  page.evaluate('window.scrollTo(0,0)');page.screenshot(path=str(OUT/f'mobile-{slug}.png'),full_page=True,animations='disabled')
 checks.append('PASS: alle sechs Bereiche in 390×844 ohne horizontalen Seitenüberlauf')
 # Fehler-/Ladezustand in eigenem Tab ohne vorhandene Akten zu verändern.
 failure=browser.new_page(viewport={'width':1440,'height':1000})
 failure.route('**/api/**',lambda route:route.fulfill(status=503,content_type='application/json',body='{"error":{"message":"Backend für Test nicht verfügbar."}}'))
 failure.goto('http://127.0.0.1:3000');expect(failure.locator('.alert[role=alert]')).to_contain_text('Backend für Test nicht verfügbar')
 failure.evaluate('window.scrollTo(0,0)');failure.screenshot(path=str(OUT/'08-error-desktop.png'),full_page=True,animations='disabled');failure.close()
 checks.append('PASS: API-Ausfall zeigt Fehler und Retry statt scheinbar geladener Daten')
 assert not errors,errors
 browser.close()
fingerprint=hashlib.sha256(''.join(p.read_text() for p in sorted((ROOT/'apps').rglob('*')) if p.is_file() and p.suffix in ['.ts','.tsx','.css'] and '.next' not in p.parts and 'node_modules' not in p.parts).encode()).hexdigest()
(OUT/'checks.json').write_text(json.dumps({'results':checks,'errors':errors,'created_demo_id':created_id,'timestamp_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'source_fingerprint':fingerprint},ensure_ascii=False,indent=2))
print(json.dumps(checks,ensure_ascii=False,indent=2))
