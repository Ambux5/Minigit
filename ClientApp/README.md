CVIČNÝ ÚKOL – Hledáme šikovného web developera!
Napište jednoduchý program, který bude umět detekovat změny v adresáři uvedeném na vstupu.
Adresář se bude nacházet na filesystému, na kterém běží daný program (lokální filesystém). Při
prvním spuštění si program obsah daného adresáře analyzuje a při každém dalším spuštění bude
hlásit změny od svého posledního spuštění, tj:
a) seznam nových souborů a podadresářů,
b) seznam změněných souborů (změnou se rozumí změna obsahu daného souboru),
c) seznam odstraněných souborů a podadresářů.
U každého souboru evidujte číslo jeho aktuální verze (na začátku budou mít všechny soubory verzi 1,
s každou detekovanou změnou daného souboru bude jeho verze navýšena o 1).
Program realizujte jako jednoduchou ASP.NET aplikaci naprogramovanou v C#. UI vytvořte jako
webovou aplikaci dle své volby (Core MVC, MVC, REST API)
Můžete předpokládat, že velikost souborů v adresáři bude do 50 MB a že počet souborů v každém
adresáři bude nanejvýš 100.
Program se bude spouštět ručně z UI stiskem tlačítka nebo zavoláním REST API endpointu
(nedetekujte změny filesystému automaticky). Pro perzistenci dat nepoužívejte databázi.
V případě MVC bude UI obsahovat alespoň textbox (textový input) pro zadání cesty k analyzovanému
adresáři, tlačítko pro spuštění analýzy a výpis jejího výsledku. V případě REST API bude cesta předána
jako URL parametr.
Své řešení stručně popište a zmiňte i jeho případná omezení. Pokud k vygenerování kódu použijete
AI, uveďte to v popisu.