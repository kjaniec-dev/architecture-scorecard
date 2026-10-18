import type { Messages } from "./types";

export const pl: Messages = {
  nativeName: "Polski",
  meta: {
    title: "Architecture & Delivery Scorecard: darmowa ocena architektury i wdrożeń",
    description:
      "Darmowy, działający w przeglądarce przegląd kondycji architektury i wdrożeń. Odpowiedz na 20 pytań i dostań wynik w każdym obszarze, 3 największe ryzyka i rekomendacje. Bez konta, bez śledzenia, bez AI.",
  },
  header: {
    skip: "Przejdź do treści",
    badge: "Za darmo · Bez konta · Bez śledzenia · Bez AI",
    themeLabel: "Motyw",
    themes: { system: "Auto", light: "Jasny", dark: "Ciemny" },
    languageLabel: "Język",
  },
  home: {
    lead: "Darmowy, działający w przeglądarce przegląd kondycji Twojego systemu i sposobu, w jaki go wdrażasz. Odpowiedz na 20 pytań o wdrożenia, monitoring, kopie zapasowe i dostęp do produkcji, a dostaniesz wynik w każdym obszarze, trzy największe ryzyka i wskazówki, co z nimi zrobić.",
    facts: [
      ["Około 5 minut", "20 pytań w 5 obszarach"],
      ["Prywatnie", "nic nie jest nigdzie wysyłane, wszystko działa w Twojej przeglądarce"],
      ["Oparte na regułach", "bez AI, więc widzisz dokładnie, jak powstaje wynik"],
    ],
    howTitle: "Jak to działa",
    how: [
      [
        "Bez AI, tylko reguły",
        "Każda odpowiedź ma stały wynik od 0 do 3. Każde pytanie ma wagę, a Twój wynik to ważony udział zdobytych punktów w puli dostępnych, osobno dla każdego obszaru i łącznie. Te same odpowiedzi zawsze dają ten sam rezultat. Największe ryzyka to pytania z największą ważoną różnicą względem najlepszej odpowiedzi.",
      ],
      [
        "Prywatność z założenia",
        "Nie ma kont, ciasteczek, analityki ani zapytań do podmiotów trzecich. Twoje odpowiedzi zostają w tej przeglądarce (local storage, żebyś mógł wrócić do ankiety) i nigdy nie są wysyłane. Link do wyników zawiera odpowiedzi w części adresu po znaku #, której przeglądarki nie wysyłają do serwerów.",
      ],
      [
        "Czym to jest, a czym nie",
        "Szybka, szczera samoocena, która wskazuje typowe luki. To nie jest audyt: nie widzi Twojego prawdziwego systemu, więc potraktuj wynik jako punkt wyjścia do rozmowy, a nie wyrok.",
      ],
    ],
    noscript: "Ten scorecard wymaga JavaScriptu działającego w Twojej przeglądarce. Nic nie jest wysyłane na serwer.",
  },
  intro: {
    start: "Zacznij sprawdzanie",
    resume: (answered, total) => `Wznów (odpowiedzi: ${answered} z ${total})`,
    seeLast: "Zobacz ostatnie wyniki",
    startOver: "Zacznij od nowa",
  },
  quiz: {
    progress: "Postęp",
    step: (step, steps, answered, total) => `Krok ${step} z ${steps} · odpowiedzi: ${answered} z ${total}`,
    back: "Wstecz",
    next: "Dalej",
    seeResults: "Pokaż wyniki",
    incomplete: "Odpowiedz na wszystkie pytania w tej sekcji, aby przejść dalej.",
  },
  results: {
    title: "Twoje wyniki",
    scoreLabel: (score) => `Wynik ${score} na 100`,
    byArea: "Wynik według obszarów",
    risks: (count) => (count === 3 ? "Twoje 3 największe ryzyka" : "Twoje największe ryzyka"),
    noGaps: "Nie znaleziono luk: każda odpowiedź była najlepszą opcją. Świetna robota.",
    yourAnswer: "Twoja odpowiedź: ",
    whyItMatters: "Dlaczego to ważne: ",
    whatToDo: "Co zrobić: ",
    ctaTitle: "Chcesz drugiej pary oczu?",
    ctaText:
      "Scorecard widzi tylko to, co mu powiesz. Na przeglądzie architektury zestawiamy te wyniki z Twoim prawdziwym systemem i zamieniamy je w plan z priorytetami.",
    ctaButton: "Umów przegląd architektury",
    ctaMailHint: "Otworzy Twoją aplikację pocztową z wypełnionymi wynikami. Nic nie zostanie wysłane, dopóki nie klikniesz „wyślij”.",
    ctaBookingHint: "Otworzy stronę rezerwacji.",
    copyLink: "Skopiuj link do tych wyników",
    copied: "Skopiowano link.",
    copyFailed: "Nie udało się skopiować. Skopiuj adres z paska przeglądarki.",
    print: "Drukuj lub zapisz jako PDF",
    retake: "Wypełnij ponownie",
    disclaimer:
      "Orientacyjna samoocena oparta na regułach i Twoich odpowiedziach. To nie jest audyt i nie sprawdza Twoich systemów.",
    radar: (scores) => `Wykres radarowy wyników według obszarów: ${scores.map((s) => `${s.name} ${s.score}`).join(", ")}.`,
  },
  ratings: {
    "high-risk": {
      label: "Wysokie ryzyko",
      text: "Brakuje kilku fundamentów. Zacznij od poniższych ryzyk: to one najpewniej doprowadzą do awarii lub utraty danych.",
    },
    "needs-attention": {
      label: "Wymaga uwagi",
      text: "Podstawy są częściowo na miejscu, ale są luki, które mogą zaboleć pod presją.",
    },
    solid: {
      label: "Solidnie",
      text: "Masz dobry fundament. Ukierunkowane usprawnienia przeniosą Cię z poziomu solidnego do odpornego.",
    },
    strong: {
      label: "Bardzo dobrze",
      text: "Świetne praktyki w całej linii. Teraz chodzi o to, by utrzymać je aktualnymi i przetestowanymi.",
    },
  },
  severities: { high: "Wysoki priorytet", medium: "Średni priorytet", low: "Niski priorytet" },
  email: {
    subject: (overall) => `Prośba o przegląd architektury (scorecard ${overall}/100)`,
    greeting: "Cześć,",
    intro: "chcę umówić przegląd architektury. Oto wyniki mojego scorecardu:",
    about: "Kilka słów o naszym systemie i zespole:",
    heading: (overall, rating) => `Architecture & Delivery Scorecard: ${overall}/100 (${rating})`,
    risks: "Największe ryzyka:",
    fullResults: "Pełne wyniki:",
  },
  footer: { source: "Kod źródłowy na GitHubie" },
  areas: {
    delivery: {
      name: "Wdrożenia i wydania",
      short: "Wdrożenia",
      blurb: "Jak kod trafia z laptopa na produkcję.",
    },
    operations: {
      name: "Obserwowalność i utrzymanie",
      short: "Utrzymanie",
      blurb: "Jak szybko zauważasz problemy i je naprawiasz.",
    },
    resilience: {
      name: "Odporność i dane",
      short: "Odporność",
      blurb: "Co się dzieje, gdy coś się zepsuje lub zniknie.",
    },
    security: {
      name: "Bezpieczeństwo i dostępy",
      short: "Bezpieczeństwo",
      blurb: "Kto może dotknąć produkcji i czy byś się o tym dowiedział.",
    },
    architecture: {
      name: "Architektura i wiedza",
      short: "Architektura",
      blurb: "Jak zrozumiały i podatny na zmiany jest system.",
    },
  },
  questions: {
    "deploy-method": {
      text: "Jak zmiana trafia na produkcję?",
      options: [
        "Ktoś kopiuje pliki albo wpisuje komendy ręcznie na serwerze",
        "Istnieje skrypt, ale uruchamia go ręcznie tylko kilka osób",
        "Wdraża pipeline CI/CD, ale po drodze są kroki ręczne lub zatwierdzenia",
        "Pipeline wdraża za każdym razem tak samo, bez ręcznych kroków poza akceptacją",
      ],
      risk: "Wydania zależą od ręcznych kroków",
      impact:
        "Ręczne wdrożenia są wolne, podatne na błędy i zależne od konkretnych osób, więc każde wydanie niesie ryzyko, którego można uniknąć.",
      fix: "Przenieś ścieżkę wdrożenia do jednego pipeline'u: zbuduj raz, wdrażaj ten sam artefakt wszędzie i zrób z pipeline'u jedyną drogę na produkcję.",
    },
    "release-frequency": {
      text: "Jak często wydajecie zmiany na produkcję?",
      options: [
        "Rzadziej niż raz na kwartał albo każde wydanie to wielkie wydarzenie",
        "Mniej więcej raz w miesiącu",
        "Co tydzień",
        "Gdy tylko zmiana jest gotowa: kilka razy w tygodniu lub codziennie",
      ],
      risk: "Rzadkie, duże wydania",
      impact:
        "Duże paczki zmian ukrywają błędy, utrudniają diagnozę awarii i spowalniają informację zwrotną od klientów.",
      fix: "Zmniejsz rozmiar paczki: wydawaj za feature flagami, tnij pracę na mniejsze przyrosty i zacznij od skrócenia odstępu między wydaniami o połowę, zanim zaczniesz optymalizować cokolwiek innego.",
    },
    rollback: {
      text: "Co robicie, gdy wydanie pójdzie źle?",
      options: [
        "Improwizujemy: nie ma ustalonej drogi powrotu (albo nie wiem)",
        "Da się cofnąć zmianę, ale ręcznie i nigdy tego nie ćwiczyliśmy",
        "Mamy opisany rollback i już go używaliśmy",
        "Rollback to jedno kliknięcie albo dzieje się automatycznie, i go ćwiczymy",
      ],
      risk: "Brak sprawdzonego sposobu na wycofanie złego wydania",
      impact: "Nieudane wydanie zamienia się w długą awarię, bo zespół dopiero wymyśla, jak wrócić.",
      fix: "Zdefiniuj i przećwicz rollback przy najbliższym wydaniu: trzymaj poprzedni artefakt gotowy do wdrożenia, rób zmiany w bazie wstecznie kompatybilne i zmierz, ile trwa cofnięcie.",
    },
    "release-tests": {
      text: "Co powstrzymuje zepsutą zmianę przed dotarciem na produkcję?",
      options: [
        "Nic zautomatyzowanego: polegamy na ręcznych sprawdzeniach albo szczęściu",
        "Są jakieś testy automatyczne, ale uruchamiamy je rzadko albo ignorujemy, gdy padają",
        "Testy działają w CI przy każdej zmianie, ale pokrycie jest dziurawe albo część testów jest niestabilna",
        "Zaufany zestaw testów automatycznych blokuje wydanie przy błędzie, w tym krytyczne ścieżki użytkownika",
      ],
      risk: "Brak wiarygodnej siatki bezpieczeństwa przed produkcją",
      impact: "Regresje trafiają do klientów, a zespół zaczyna bać się zmieniać cokolwiek.",
      fix: "Zacznij od małego zestawu testów wokół ścieżek, które zarabiają lub tracą pieniądze, spraw, by blokowały merge, a niestabilne testy napraw lub usuń zamiast puszczać je ponownie.",
    },
    monitoring: {
      text: "Skąd wiecie, że coś na produkcji przestało działać?",
      options: [
        "Dowiadujemy się od klientów albo współpracowników (albo nie wiem)",
        "Prosty monitoring dostępności pinguje stronę",
        "Metryki i alerty obejmują główne usługi, a ktoś dostaje powiadomienie",
        "Alerty są oparte na celach widocznych dla użytkownika (SLO), mają właścicieli i są przeglądane pod kątem szumu",
      ],
      risk: "O problemach dowiadują się pierwsi klienci",
      impact: "Awarie trwają dłużej i kosztują zaufanie, bo wykrycie zaczyna się dopiero, gdy ktoś się poskarży.",
      fix: "Alertuj na to, co czują użytkownicy (odsetek błędów, opóźnienia i dostępność kluczowych ścieżek) i kieruj alerty do konkretnej osoby lub grafiku dyżurów, a nie na wspólną skrzynkę.",
    },
    logging: {
      text: "Jak dobrze potraficie zbadać, co się stało?",
      options: [
        "Logujemy się na serwery i czytamy pliki albo logów jest niewiele",
        "Logi trafiają w jedno miejsce, ale są nieustrukturyzowane i trudne do przeszukania",
        "Scentralizowane, przeszukiwalne logi z identyfikatorami żądań lub korelacji",
        "Logi, metryki i trace'y są powiązane, więc jedno żądanie można prześledzić przez wszystkie usługi",
      ],
      risk: "Wolne, ręczne diagnozowanie problemów",
      impact: "Diagnoza zajmuje godziny zamiast minut, a część problemów nigdy nie zostaje wyjaśniona.",
      fix: "Zbierz logi w jednym miejscu, przejdź na logowanie strukturalne (JSON) i przekazuj identyfikator korelacji przez każde żądanie, by dało się prześledzić pojedynczy błąd od początku do końca.",
    },
    incidents: {
      text: "Co się dzieje, gdy wystąpi incydent?",
      options: [
        "Zajmuje się nim ten, kto go zauważy, ad hoc",
        "Kilka osób wie, co robić, ale nic nie jest spisane",
        "Jest grafik dyżurów i runbooki dla typowych awarii",
        "Dyżury, runbooki i bezwinne przeglądy po incydentach ze śledzonymi działaniami naprawczymi",
      ],
      risk: "Brak zdefiniowanej reakcji na incydenty",
      impact: "Incydenty opierają się na bohaterstwie, powtarzają się i wypalają osoby, które znają system.",
      fix: "Spisz jednostronicowy proces incydentów (kto prowadzi, gdzie rozmawiacie, kto informuje klientów), dodaj runbooki dla trzech najbardziej prawdopodobnych awarii i opisuj na piśmie każdy poważny incydent.",
    },
    capacity: {
      text: "Jak dobrze rozumiecie wydajność i pojemność systemu?",
      options: [
        "Dowiadujemy się, gdy system zwalnia albo się przewraca",
        "Zerkamy na podstawowe wykresy zasobów (CPU, pamięć, dysk), kiedy sobie o nich przypomnimy",
        "Śledzimy trendy wydajności i znamy z grubsza nasze limity",
        "Robimy testy obciążeniowe przed dużymi zmianami lub wydarzeniami i planujemy pojemność z wyprzedzeniem",
      ],
      risk: "Nieznane limity pojemności",
      impact: "Wzrost lub skok ruchu może położyć system bez ostrzeżenia.",
      fix: "Zmierz obecne szczytowe obciążenie, zrób prosty test obciążeniowy, by znaleźć pierwsze wąskie gardło, i ustaw alerty dużo przed tym limitem (dysk, połączenia, długość kolejki).",
    },
    backups: {
      text: "Jak wygląda ochrona danych produkcyjnych i kopie zapasowe?",
      options: [
        "Brak kopii zapasowych albo nie jestem pewien, czy istnieją",
        "Kopie istnieją, ale nikt nie sprawdza, czy się udają",
        "Automatyczne, monitorowane kopie przechowywane osobno od produkcji",
        "Automatyczne, monitorowane, wersjonowane lub niezmienne kopie w osobnym koncie lub lokalizacji",
      ],
      risk: "Utrata danych nie jest bezpiecznie zabezpieczona",
      impact: "Skasowana baza, błędna migracja albo ransomware mogą okazać się nie do odzyskania.",
      fix: "Zautomatyzuj kopie każdego magazynu danych, trzymaj ich kopie w osobnym koncie lub lokalizacji, alertuj o nieudanych lub brakujących kopiach i zadbaj, by co najmniej jedna kopia była niezmienna.",
    },
    restore: {
      text: "Czy kiedykolwiek odtwarzaliście dane z kopii zapasowej?",
      options: [
        "Nigdy (albo nie wiem)",
        "Raz, dawno temu",
        "Od czasu do czasu testujemy odtworzenie ręcznie",
        "Odtworzenia testujemy według harmonogramu i wiemy, ile trwają",
      ],
      risk: "Kopie nigdy nie zostały sprawdzone pod kątem odtworzenia",
      impact: "Nieprzetestowana kopia to nadzieja, a nie plan; problemy zwykle wychodzą dopiero w trakcie incydentu.",
      fix: "Zaplanuj w tym miesiącu test odtworzenia do czystego środowiska, zapisz, ile trwał i co nie zadziałało, a potem powtarzaj co kwartał (i zautomatyzuj, gdy już zadziała).",
    },
    "single-points": {
      text: "Co się stanie, gdy padnie kluczowy serwer, baza danych lub strefa dostępności?",
      options: [
        "Wszystko działa na jednym serwerze lub instancji; system leży, dopóki go nie naprawimy",
        "Część elementów jest zdublowana, ale baza danych lub inne kluczowe części nie",
        "Krytyczne komponenty są zdublowane, a przełączenie awaryjne jest automatyczne",
        "Redundancja między strefami, a failover jest regularnie testowany",
      ],
      risk: "Pojedyncze punkty awarii",
      impact: "Jedna awaria sprzętu, sieci lub dostawcy wyłącza cały produkt.",
      fix: "Wypisz komponenty, których awaria zatrzymuje biznes, i usuwaj je po kolei, zaczynając od magazynu danych; zarządzana baza wielostrefowa to zwykle najtańszy pierwszy krok.",
    },
    rebuild: {
      text: "Czy potrafilibyście odtworzyć infrastrukturę od zera?",
      options: [
        "Serwery były konfigurowane ręcznie przez lata; nikt nie umiałby ich dokładnie odtworzyć",
        "Część jest oskryptowana, ale dużo konfiguracji żyje tylko na maszynach",
        "Głównie infrastruktura jako kod, z kilkoma ręcznymi lukami",
        "W pełni zdefiniowana jako kod i odtworzyliśmy już środowisko od zera",
      ],
      risk: "Infrastruktury nie da się odtworzyć",
      impact: "Odtworzenie po katastrofie, a nawet stworzenie kopii stagingu, staje się powolnym zgadywaniem.",
      fix: "Opisz infrastrukturę kodem (Terraform, Pulumi albo przynajmniej skrypty i zarządzanie konfiguracją), zaczynając od sieci i zasobów obliczeniowych, i udowodnij to, budując jednorazową kopię.",
    },
    "prod-access": {
      text: "Kto ma dostęp do produkcji i w jaki sposób?",
      options: [
        "Wspólne loginy albo wiele osób ma prawa administratora (albo nie wiem)",
        "Każdy ma własne konto, ale uprawnienia są szerokie",
        "Dostęp oparty na rolach i zasadzie najmniejszych uprawnień, okazjonalnie przeglądany",
        "Najmniejsze uprawnienia, MFA wszędzie, czasowe podniesienie uprawnień i regularne przeglądy dostępów",
      ],
      risk: "Dostęp do produkcji jest zbyt szeroki",
      impact: "Jedno skradzione lub nadużyte konto może odczytać, zmienić lub skasować wszystko.",
      fix: "Usuń wspólne dane logowania, wymuś MFA, ogranicz stałe prawa administratora do garstki osób, które ich potrzebują, i co kwartał przeglądaj listę dostępów, także osób odchodzących.",
    },
    secrets: {
      text: "Gdzie trzymacie hasła, klucze API i certyfikaty?",
      options: [
        "W repozytorium kodu, na czacie albo w plikach konfiguracyjnych przekazywanych dalej",
        "W zmiennych środowiskowych CI lub serwera, rotowane ręcznie, jeśli w ogóle",
        "W menedżerze sekretów, z rotacją części z nich",
        "W menedżerze sekretów z automatyczną rotacją i skanowaniem sekretów w CI",
      ],
      risk: "Sekrety są słabo chronione",
      impact:
        "Wyciekłe poświadczenia to bardzo częsta droga na produkcję, a trudno je unieważnić, gdy nikt nie wie, gdzie są używane.",
      fix: "Przeskanuj historię repozytorium pod kątem sekretów i zrotuj wszystko, co znajdziesz, potem przenieś poświadczenia do menedżera sekretów i dodaj skanowanie do pipeline'u.",
    },
    patching: {
      text: "Jak aktualizujecie zależności i systemy?",
      options: [
        "Bez procesu: aktualizujemy, gdy coś nas do tego zmusi",
        "Okazjonalne aktualizacje, zwykle po alarmie bezpieczeństwa",
        "Regularne, zaplanowane aktualizacje systemu, środowiska uruchomieniowego i bibliotek",
        "Automatyczne skanowanie zależności i podatności oraz ustalony czas na naprawę krytycznych problemów",
      ],
      risk: "Znane podatności pozostają niezałatane",
      impact:
        "Opublikowane podatności są wykorzystywane w ciągu dni, a im dłużej zwlekasz, tym trudniejsze stają się aktualizacje.",
      fix: "Włącz automatyczne aktualizacje zależności i alerty o podatnościach oraz ustal okno na naprawę krytycznych problemów (na przykład siedem dni).",
    },
    "audit-trail": {
      text: "Czy potraficie powiedzieć, kto co zrobił na produkcji?",
      options: [
        "Nie, albo nie wiem",
        "Częściowo: niektóre systemy zapisują logi, ale nikt do nich nie zagląda",
        "Logi audytowe akcji administracyjnych i wdrożeń są przechowywane i przeszukiwalne",
        "Logi audytowe są przechowywane, chronione przed manipulacją, a alerty odpalają się przy podejrzanych działaniach",
      ],
      risk: "Brak śladu audytowego zmian na produkcji",
      impact: "Po włamaniu lub złej zmianie nie da się odtworzyć, co się stało, ani udowodnić, czego nie zrobiono.",
      fix: "Włącz logowanie audytowe w chmurze i narzędziach administracyjnych, wysyłaj zdarzenia administracyjne i wdrożeniowe do przechowywanego, chronionego przed zapisem magazynu i alertuj o działaniach wysokiego ryzyka, np. nowych kontach administratorów.",
    },
    documentation: {
      text: "Jak dobrze jest udokumentowana architektura?",
      options: [
        "Żyje w głowach ludzi",
        "Jakieś dokumenty istnieją, ale są nieaktualne",
        "Aktualne diagramy głównych komponentów i przepływów danych",
        "Aktualne diagramy oraz rekordy decyzji (ADR) wyjaśniające, dlaczego rzeczy są takie, jakie są",
      ],
      risk: "Architektura nie jest udokumentowana",
      impact:
        "Wdrażanie nowych osób jest wolne, decyzje są dyskutowane od nowa, a zmiany powstają bez zrozumienia skutków ubocznych.",
      fix: "Narysuj jednostronicowy diagram głównych komponentów z właścicielami, trzymaj go w repozytorium i zacznij zapisywać istotne decyzje jako krótkie ADR-y.",
    },
    "key-person": {
      text: "Gdyby jutro odszedł Wasz najbardziej doświadczony inżynier...",
      options: [
        "...mielibyśmy poważny kłopot: krytyczna wiedza siedzi w jednej osobie",
        "...bardzo by to zabolało: tylko dwie osoby znają krytyczne części",
        "...poradzilibyśmy sobie: większość zespołu potrafi pracować przy krytycznych częściach",
        "...ledwo byśmy to zauważyli: wiedza jest spisana, dzielona i rotowana",
      ],
      risk: "Zależność od jednej kluczowej osoby",
      impact: "Urlop, rezygnacja lub choroba mogą zatrzymać dostarczanie albo zostawić produkcję bez wsparcia.",
      fix: "Pracuj w parach nad krytycznymi obszarami, rotuj osoby odpowiedzialne za wydania i dyżury, a kluczowa osoba niech spisze (albo nagra) to, co wie tylko ona, zaczynając od runbooka produkcyjnego.",
    },
    "tech-debt": {
      text: "Jak podchodzicie do długu technicznego?",
      options: [
        "Ignorujemy go: nigdy nie ma na to czasu",
        "Wiemy o nim, ale nic nie jest zaplanowane",
        "Jest backlog i część czasu zespołu idzie na dług",
        "Widoczny backlog, jawny budżet czasu w każdym cyklu i przegląd postępów",
      ],
      risk: "Dług techniczny jest niezarządzany",
      impact: "Tempo dostarczania z czasem spada, a koszt każdej zmiany stale rośnie.",
      fix: "Uwidocznij dług: wypisz dziesięć najważniejszych pozycji z ich kosztem dla biznesu, a potem zarezerwuj stały udział każdej iteracji (10-20%) na ich spłatę.",
    },
    "change-risk": {
      text: "Jak ryzykowna jest typowa zmiana w głównym systemie?",
      options: [
        "Przerażająca: zmiany często psują niepowiązane rzeczy",
        "Ryzykowna: unikamy dotykania pewnych obszarów",
        "Zwykle ograniczona do jednego miejsca, z kilkoma silnie powiązanymi obszarami",
        "Przewidywalna: moduły mają jasne granice i właścicieli",
      ],
      risk: "Zmiany są ryzykowne, a komponenty silnie sprzężone",
      impact: "Strach przed zmianą spowalnia każdy projekt i spycha problemy na produkcję.",
      fix: "Znajdź najbardziej kruchy obszar, dodaj wokół niego testy charakteryzujące i krok po kroku wprowadzaj jasne granice modułów zamiast próbować przepisywać wszystko od nowa.",
    },
  },
};
