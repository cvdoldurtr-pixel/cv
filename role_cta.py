# -*- coding: utf-8 -*-
"""Meslek rehber sayfalarındaki "Ücretsiz CV Oluştur" butonlarını, o mesleğin hazır
örneğini açacak şekilde /?role=<id> adresine çevirir (src/utils/starters.ts ile aynı id'ler).
build.py sonunda otomatik çalışır; tek başına da çalıştırılabilir: python3 role_cta.py
Tekrar tekrar çalıştırmak güvenlidir."""
import os, re

ROLE_BY_PAGE = {
    'yazilimci-cv-ornegi': 'yazilim',
    'pazarlamaci-cv-ornegi': 'pazarlama',
    'satis-temsilcisi-cv-ornegi': 'satis',
    'yeni-mezun-cv-ornegi': 'yenimezun',
    'istanbul-yeni-mezun-is-bulma-rehberi': 'yenimezun',
    'muhasebeci-cv-ornegi': 'muhasebe',
    'muhasebe-cv-ornegi': 'muhasebe',
    'ogretmen-cv-ornegi': 'ogretmen',
    'hemsire-cv-ornegi': 'hemsire',
    'muhendis-cv-ornegi': 'muhendis',
    'kasiyer-tezgahtar-cv-ornegi': 'kasiyer',
    'sofor-kurye-cv-ornegi': 'sofor',
    'garson-restoran-cv-ornegi': 'garson',
    'grafik-tasarimci-cv-ornegi': 'grafik',
    'insan-kaynaklari-cv-ornegi': 'ik',
    'lojistik-uzman-cv-ornegi': 'lojistik',
    'sekreter-cv-ornegi': 'sekreter',
}

def run(root=None):
    root = root or os.path.dirname(os.path.abspath(__file__))
    pub = os.path.join(root, 'public')
    changed = 0
    for slug, role in ROLE_BY_PAGE.items():
        f = os.path.join(pub, slug + '.html')
        if not os.path.exists(f):
            continue
        t = open(f, encoding='utf-8').read()
        n = re.sub(r'href="/\?(?:start=1|role=[a-z]+)"', f'href="/?role={role}"', t)
        if n != t:
            open(f, 'w', encoding='utf-8').write(n)
            changed += 1
    print('role_cta: güncellenen sayfa', changed)

if __name__ == '__main__':
    run()
