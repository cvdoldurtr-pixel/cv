# -*- coding: utf-8 -*-
# Canlıya çıkmadan önce: python3 kontrol.py  (hata varsa çıkış kodu 1)
import re, glob, sys, os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
bad = []
for f in glob.glob('public/*.html'):
    t = open(f, encoding='utf-8', errors='replace').read()
    if 'WEB3FORMS_ACCESS_KEY' in t: bad.append(f'{f}: Web3Forms erişim anahtarı eksik (legal.py > WEB3FORMS_KEY)')
    if 'DOLDURULACAK' in t: bad.append(f'{f}: satıcı bilgisi (DOLDURULACAK) eksik')
    if f.startswith('public/') and ('Esnaf' in t or 'esnaf' in t): bad.append(f'{f}: eski paket adı "Esnaf" kalmış')
    for p in ['50.000+', '4.8★', 'Kredi kartı gerekmez', 'İptal istediğinizde', 'ozgecmispro', 'ATS garantili', 'KVKK uyumlu']:
        if p in t: bad.append(f'{f}: yanıltıcı/eski ifade "{p}"')
    u = t.replace('&#x27;', "'").replace('’', "'")
    for m in re.finditer(r"(Denizli|Kayseri|Kocaeli|Mersin|Eskişehir|Trabzon)'(nın|da|ta)\b", u):
        if not (m.group(1) == 'Trabzon' and m.group(2) == 'da'):
            bad.append(f'{f}: Türkçe ek hatası "{m.group(0)}"')
for f in ['public/robots.txt', 'public/sitemap.xml']:
    if 'cvdoldur.com.tr' not in open(f, encoding='utf-8').read(): bad.append(f'{f}: cvdoldur.com.tr yok')


# --- v9 ek denetimler ---
import glob as _g
_h=_g.glob('public/*.html')
_noako=[f for f in _h if 'akodijital.com' not in open(f,encoding='utf-8').read() and not f.endswith(('og.html',))]
_extra=bad
if _noako: _extra.append(f'AKO Dijital imzası olmayan sayfa: {len(_noako)} (örn. {_noako[0]})')
_il=open('public/iletisim.html',encoding='utf-8').read()
for _k in ['Sondurak','0542','Hüseyin']:
    if _k not in _il: _extra.append(f'public/iletisim.html: satıcı bilgisi eksik ({_k})')
for _f in _h+['src/components/Landing.tsx']:
    if "KVKK'ya uygun" in open(_f,encoding='utf-8').read(): _extra.append(f'{_f}: kanıtlanamayan "KVKK\'ya uygun" ifadesi')

print('\n'.join(bad) if bad else 'TEMİZ: yayına hazır (Netlify env ve PayTR testini unutmayın)')
sys.exit(1 if bad else 0)
