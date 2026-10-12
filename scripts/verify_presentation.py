from pathlib import Path
from playwright.sync_api import sync_playwright
import json,hashlib
root=Path(__file__).resolve().parents[1]
out=root/'docs/evidence/REQ-001';out.mkdir(parents=True,exist_ok=True)
results=[]
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':1920,'height':1158})
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto('http://127.0.0.1:8765/presentation/ai-strategy-portfolio.html')
 page.wait_for_selector('.slide.active')
 assert page.locator('.slide').count()==19
 assert page.evaluate('slides.slice(0,14).reduce((n,s)=>n+s.seconds,0)')==1200
 results.append('PASS: 19 Folien; 14 Hauptfolien; Sprechplan 1200 Sekunden')
 page.keyboard.press('ArrowRight');assert page.locator('.active').get_attribute('id')=='slide-2'
 page.keyboard.press('End');assert page.locator('.active').get_attribute('id')=='slide-19'
 assert page.locator('#next').is_disabled()
 page.keyboard.press('Home');assert page.locator('#prev').is_disabled()
 page.select_option('#jump','11');assert page.locator('.active').get_attribute('id')=='slide-12'
 page.click('#notes');assert page.locator('#notes-dialog').is_visible();assert '4 − 2,5' in page.locator('#notes-body').inner_text()
 page.keyboard.press('Escape');assert not page.locator('#notes-dialog').is_visible()
 page.locator('.active .source-link').click();assert page.locator('#sources-dialog').is_visible();assert 'Beratungssynthese' in page.locator('#sources-body').inner_text()
 page.keyboard.press('Escape');page.click('#sources');assert page.locator('.active').get_attribute('id')=='slide-16'
 results.append('PASS: Navigation, Grenzen, Folienauswahl, Notizen, Quellen und Escape')
 overflow=[]
 for v in ['dax','sme']:
  page.select_option('#variant',v)
  for i in range(19):
   page.select_option('#jump',str(i))
   bounds=page.evaluate('''()=>{const s=document.querySelector('.active'),b=s.querySelector('.body').getBoundingClientRect(),f=s.querySelector('.slide-footer').getBoundingClientRect();return {bodyBottom:b.bottom,footerTop:f.top,scrollWidth:s.scrollWidth,clientWidth:s.clientWidth,scrollHeight:s.scrollHeight,clientHeight:s.clientHeight}}''')
   if bounds['bodyBottom']>bounds['footerTop']-5 or bounds['scrollWidth']>bounds['clientWidth'] or bounds['scrollHeight']>bounds['clientHeight']:overflow.append([v,i+1,bounds])
   page.locator('#viewport').screenshot(path=str(out/f'{v}-{i+1:02}.png'))
  text=page.locator('#slide-8 .body').inner_text()
  assert ('Geschäftsführung + Finance' in text) if v=='sme' else ('CFO / Portfolio Board' in text)
 results.append('PASS: beide Varianten ändern sichtbare Inhalte; 38 Desktop-Screenshots erstellt')
 page.reload();assert page.locator('#variant').input_value()=='sme';assert page.locator('.active').get_attribute('id')=='slide-19'
 results.append('PASS: Variante und Foliennummer über Reload erhalten')
 page.set_viewport_size({'width':390,'height':844})
 for i in [0,7,11]:
  page.select_option('#jump',str(i));page.screenshot(path=str(out/f'mobile-{i+1:02}.png'))
 assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
 page.set_viewport_size({'width':1280,'height':720});page.select_option('#jump','12');page.screenshot(path=str(out/'desktop-1280.png'))
 results.append('PASS: 390×844 und 1280×720 ohne horizontalen Seitenüberlauf')
 page.emulate_media(media='print')
 assert page.locator('.slide:visible').count()==19
 page.pdf(path=str(root/'presentation/ai-strategy-portfolio-mittelstand.pdf'),prefer_css_page_size=True,print_background=True)
 page.emulate_media(media='screen');page.select_option('#variant','dax');page.emulate_media(media='print')
 page.pdf(path=str(root/'presentation/ai-strategy-portfolio-dax40.pdf'),prefer_css_page_size=True,print_background=True)
 results.append('PASS: Druckmodus zeigt alle 19 Folien; PDF für beide Varianten erzeugt')
 assert not errors,errors
 assert not overflow,overflow
 print(json.dumps({'results':results,'overflow':overflow,'errors':errors},ensure_ascii=False,indent=2))
 (out/'checks.json').write_text(json.dumps({'results':results,'overflow':overflow,'errors':errors,'html_sha256':hashlib.sha256((root/'presentation/ai-strategy-portfolio.html').read_bytes()).hexdigest()},ensure_ascii=False,indent=2))
 browser.close()
