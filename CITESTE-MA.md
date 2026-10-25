# Dicționar toponimic al reliefului românesc — site cu administrare (Netlify)

## Ce conține
- `public/` — site-ul: `index.html`, `style.css`, `app.js`, `data.json` (conținutul inițial) și `img/` (cele 200 de ilustrații).
- `netlify/functions/` — funcțiile de server: citire/salvare date, autentificare, încărcare și afișare imagini.
- `netlify.toml`, `package.json`, `package-lock.json` — configurarea pentru Netlify.

## Pași de publicare (o singură dată)

1. **Cont GitHub.** Creează un cont gratuit pe github.com, dacă nu ai deja.
2. **GitHub Desktop.** Instalează aplicația GitHub Desktop (desktop.github.com) și autentifică-te.
   Interfața web GitHub acceptă maximum 100 de fișiere la o încărcare, iar proiectul are peste 200, de aceea e mai simplu cu aplicația.
3. **Creează depozitul.** Dezarhivează folderul. În GitHub Desktop: *File → Add local repository*, alege folderul, acceptă *create a repository*, apoi *Publish repository* (poate fi privat).
4. **Conectează-l la Netlify.** Pe netlify.com: *Add new site → Import an existing project → GitHub* și alege depozitul. Setările de build se citesc automat din `netlify.toml`; nu completa nimic altceva. Apasă *Deploy*.
5. **Setează parola de administrator.** În Netlify, la setările site-ului, secțiunea *Environment variables*, adaugă variabila `ADMIN_PASSWORD` cu o parolă lungă, doar a ta. Apoi, la *Deploys*, pornește din nou publicarea (*Trigger deploy*), ca funcțiile să o preia.
6. **Testează.** Deschide site-ul. Jos în pagină e linkul *Administrare* (sau adaugă `#admin` la adresă). Introdu parola.

## Cum se editează
- După autentificare apare butonul galben *Administrare* sus și bara galbenă jos.
- Pe fiecare termen: editare (text, variantă, imagine), mutare sus/jos, ștergere. Pe fiecare secțiune: editare titlu și culoare, mutare, ștergere, adăugare termen. La final de pagină: secțiune nouă.
- Modificările devin publice doar după **Publică**. *Renunță* anulează tot ce nu a fost publicat. *Ieșire* închide sesiunea de administrare.
- Imaginile încărcate sunt decupate automat în pătrat, la 640 px.

## Bine de știut
- La prima publicare din administrare, tot dicționarul se salvează în spațiul de stocare Netlify (Netlify Blobs). De atunci încolo, `data.json` din proiect rămâne doar rezervă, pentru cazul în care stocarea e goală.
- Dacă doi oameni editează în același timp, al doilea primește mesajul că pagina s-a schimbat și trebuie reîncărcată; nimic nu se suprascrie pe ascuns.
- Copie de siguranță: adresa `/api/data` a site-ului întoarce tot conținutul ca fișier JSON; salvează-l din când în când.
- Domeniu propriu: în Netlify, la *Domain management*.
- Parola nu stă în cod, doar în setările Netlify. Dacă vrei s-o schimbi, modifici variabila și pornești din nou publicarea.
