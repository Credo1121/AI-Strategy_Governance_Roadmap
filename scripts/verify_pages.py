"""Browserprüfung des statischen GitHub-Pages-Artefakts unter dem Repository-Unterpfad."""
from pathlib import Path
from playwright.sync_api import sync_playwright, expect
import os, json, datetime

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'docs/evidence/REQ-004'
OUT.mkdir(parents=True,exist_ok=True)
BASE=os.environ.get('PAGES_TEST_URL','http://127.0.0.1:4173/AI-Strategy_Governance_Roadmap/')
checks=[]
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 context=browser.new_context(viewport={'width':1440,'height':1050})
 page=context.new_page();errors=[];api_requests=[]
 page.on('pageerror',lambda error:errors.append(str(error)))
 page.on('request',lambda request:api_requests.append(request.url) if '/api/' in request.url else None)
 page.goto(BASE,wait_until='networkidle')
 expect(page.get_by_text('Pages · Browser-Demo',exact=True)).to_be_visible()
 expect(page.locator('#engagement')).to_be_enabled()
 expect(page.locator('#engagement option')).to_have_count(2)
 page.get_by_role('button',name='Neue Demoakte',exact=True).click()
 dialog=page.locator('dialog').nth(0)
 dialog.get_by_label('Name der Demoakte',exact=True).fill('Pages QA Demo')
 dialog.get_by_role('button',name='Demoakte anlegen',exact=True).click()
 created_id=page.locator('#engagement').input_value()
 page.locator('.context-panel textarea').fill('Persistenz der statischen Browser-Demo prüfen.')
 page.get_by_role('button',name='Änderungen speichern',exact=True).click()
 expect(page.get_by_text('Änderungen gespeichert.',exact=True)).to_be_visible()
 expect(page.get_by_text('Im Browser gespeichert',exact=True)).to_be_visible()
 page.reload(wait_until='networkidle');page.select_option('#engagement',created_id)
 expect(page.locator('.context-panel textarea')).to_have_value('Persistenz der statischen Browser-Demo prüfen.')
 checks.append('PASS: statische Demo geladen, neue Akte im Browser gespeichert und nach Reload wiederhergestellt')
 page.locator('.sidebar nav').get_by_role('button',name='6-Wochen-Roadmap').click()
 with page.expect_download() as download:page.get_by_role('button',name='Briefing exportieren').click()
 target=OUT/'pages-briefing-test.md';download.value.save_as(target)
 assert 'Pages QA Demo' in target.read_text() and 'SYNTHETISCHE DEMONSTRATIONSDATEN' in target.read_text()
 checks.append('PASS: Markdown-Export ohne Backend als Browserdownload erzeugt')
 assert not api_requests,api_requests
 checks.append('PASS: keine /api-Netzwerkanfrage im Pages-Modus')
 page.locator('.sidebar nav').get_by_role('button',name='Portfolio & Finanzierung').click()
 page.evaluate('window.scrollTo(0,0)');page.screenshot(path=str(OUT/'pages-desktop.png'),full_page=True,animations='disabled')
 page.set_viewport_size({'width':390,'height':844});assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
 page.evaluate('window.scrollTo(0,0)');page.screenshot(path=str(OUT/'pages-mobile.png'),full_page=True,animations='disabled')
 checks.append('PASS: Pages-Artefakt Desktop und 390 px Mobile ohne horizontalen Seitenüberlauf')
 assert not errors,errors
 browser.close()
(OUT/'checks.json').write_text(json.dumps({'results':checks,'errors':errors,'timestamp_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'base_url':BASE},ensure_ascii=False,indent=2))
print(json.dumps(checks,ensure_ascii=False,indent=2))
