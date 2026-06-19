// Locales and Translation Dictionary Module for Idle Bank Empire

const translations = {
    he: {
        appName: "אימפריית הבנקים",
        bankPrefix: "",
        mute: "השתק",
        unmute: "בטל השתקה",
        vaultVolume: "נפח",
        tooltips: {
            adv: "קמפיין שיווק ממומן להבאת לקוחות",
            guard: "לחץ כדי לשלוח את הבלדר ידנית",
            vault: "לחץ כדי לרוקן את הכספת"
        },
        cashLabel: "יתרת מזומנים",
        perSecond: "לשנייה",
        sharesLabel: "מניות זהב",
        multiplier: "מכפיל",
        simulatorTitle: "סימולטור הבנק",
        activeFlow: "זרימת כספים פעילה",
        advTitle: "📢 קמפיין פרסום ושיווק",
        advValueOff: "כבוי",
        advValueOn: "שיווק פעיל",
        guardClickHint: "(שלח בלדר 👆)",
        vaultTitle: "כספת ראשית",
        vaultLoading: "טוען נתונים...",
        collectVault: "רוקן כספת",
        tabUpgrades: "עמדות",
        tabManagers: "מנהלים",
        tabDepartments: "מחלקות",
        tabMissions: "משימות 🏆",
        tabBranches: "סניפים",
        footerText: "אימפריית הבנקים © 2026 - משחק Idle פרימיום. כל הזכויות שמורות.",
        offlineModalTitle: "ברוך שובך, מנכ\"ל!",
        offlineModalText: "הצוות והמנהלים שלך עבדו קשה בזמן שהיית רחוק וצברו רווחים עבור הבנק!",
        offlineModalBtn: "איסוף רווחים",
        offlineDoubleBtn: "🎬 צפה בסרטון וקבל פי 3!",
        offlineClaimBtn: "קבל סכום רגיל",
        langModalTitle: "בחר שפת ממשק / Choose Language",
        langModalText: "בחר את שפת הממשק המועדפת עליך / Please select your preferred language:",
        langModalClose: "סגור הגדרות / Close Settings",
        dangerZoneTitle: "אזור מסוכן ⚠️",
        themeTitle: "בחר צבע רקע:",
        resetGameBtn: "⚠️ איפוס משחק מוחלט",
        confirmPrestige: (branchName, shares) => `האם אתה בטוח שברצונך למכור את הסניף ולפתוח סניף חדש ב-${branchName}? תקבל +${shares} מניות זהב!`,
        insufficientFunds: "מחסור במזומן",
        maxLevel: "רמה מקסימלית",
        activeLabel: "פעיל 🟢",
        lockedLabel: "נעול",
        upgradeLabel: "שדרג",
        unlockLabel: "פתח דלפק",
        hireLabel: "גייס מנהל",
        hiredLabel: "מגויס ✔",
        claimReward: "קבל",
        missionCompletedTitle: "🏆 משימות שהושלמו",
        missionCompletedDesc: "בצע משימות רשמיות מטעם מועצת המנהלים של הבנק וקבל מענקים במזומן באופן מיידי!",
        alertQueueEmpty: "תור ריק",
        alertQueueFull: "תור עמוס",
        alertQueueOk: "תור תקין",
        alertQueueLabel: "תור לקוחות",
        perMinute: " לדקה",
        advSuspended: " (הושעה - חוסר מזומן)",
        tellerLabel: "כספר",
        levelLabel: "רמה",
        servingClientLabel: "לקוח בטיפול",
        collectShortLabel: "איסוף",
        guardStates: {
            idle: "שומר ממתין בכספת...",
            moving_to_tellers: "בלדר נוסע לאסוף דלפקים...",
            collecting: "מעמיס שקים...",
            moving_to_vault: "חוזר לכספת עם משלוח...",
            depositing: "פורק כסף בכספת..."
        },
        upgrades: {
            tellerTitle: (id, lvl) => `כספר ${id} - רמה ${lvl}`,
            tellerDesc: "מטפל בלקוחות ומייצר ערימות מזומנים.",
            tellerSpeed: "מהירות",
            tellerCap: "נפח דלפק",
            tellerLocked: (id) => `כספר ${id} - [נעול]`,
            tellerLockedDesc: "פתח דלפק שירות נוסף להגברת תזרים הלקוחות.",
            guardTitle: (id, lvl) => `בלדר ${id} - רמה ${lvl}`,
            guardDesc: "אוסף כסף מהדלפקים ומעביר לכספת הראשית.",
            guardSpeed: "זמן סבב",
            guardCap: "קיבולת",
            guardLocked: (id) => `בלדר ${id} - [נעול]`,
            guardLockedDesc: "גייס בלדר נוסף כדי לשנע כסף מהר יותר.",
            guardUnlockBtn: "גייס בלדר",
            vaultTitle: (lvl) => `הכספת הראשית - רמה ${lvl}`,
            vaultDesc: "שומרת את כל המזומנים שנאספו בבנק.",
            vaultCap: "נפח אחסון",
            queueTitle: (lvl) => `לובי והמתנת לקוחות - רמה ${lvl}`,
            queueDesc: "מגדיל את קיבולת תור הממתינים בסניף.",
            queueCap: "קיבולת תור",
            queueMaxTitle: "לובי והמתנת לקוחות - רמה 4 [מקס]",
            queueMaxDesc: (cap) => `קיבולת התור הגיעה לערך המקסימלי שלה (${cap} לקוחות).`,
            clientsShort: "לקוחות",
            queueUpgradeBtn: "שדרג לובי"
        },
        managers: {
            names: {
                customer: "מנהל לקוחות",
                finance: "מנהל כספים",
                operations: "מנהל תפעול",
                service: "מנהל שירות",
                vip: "מנהל VIP",
                marketing: "מנהל שיווק",
                logistics: "מנהל לוגיסטיקה",
                risk: "מנהל סיכונים",
                tech: "מנהל טכנולוגיה",
                compliance: "מנהל ציות"
            },
            descs: {
                customer: "+6% מהירות לקוחות | +3% שביעות רצון (לכל רמה)",
                finance: "ריקון כספת אוטומטי | +5% הכנסות הבנק (לכל רמה)",
                operations: "+4% מהירות בלדרים | +3% מהירות כספרים (לכל רמה)",
                service: "+5% קיבולת עמדות | +4% רווח בסיסי (לכל רמה)",
                vip: "+7% הכנסות מחלקות | +4% מניות זהב בפרסטיז' (לכל רמה)",
                marketing: "+10% בונוס פרסום | +1 שעה אופליין מקסימלית (לכל רמה)",
                logistics: "+20% קיבולת שומר (לכל רמה)",
                risk: "+12% הכנסות מחלקות מתקדמות (לכל רמה)",
                tech: "+5% EPS | +2 שעות אופליין (לכל רמה)",
                compliance: "+8% מניות זהב בפרסטיג׳ (לכל רמה)"
            }
        },
        departments: {
            names: [
                "שירותי קופה בסיסיים",
                "מחלקת הלוואות ומשכנתאות",
                "VIP בנקאות פרטית",
                "מסחר במניות וקריפטו",
                "תכנון מס \"יצירתי\""
            ],
            descLabel: "רווח בסיסי",
            statsLabel: "רווח מותאם",
            unlock: "פתח מחלקה"
        },
        branches: {
            prestigeTitle: "מנגנון ה-Prestige (מניות זהב)",
            prestigeDesc: "מכור את הבנק הנוכחי שלך והקם סניף חדש. בתמורה תקבל **מניות זהב** המעניקות בונוס קבוע לרווחים.",
            prestigeBoost: "כל מניית זהב מעניקה +5% רווח קבוע בכל הסניפים!",
            prestigeRewardLabel: "מניות זהב שתקבל במעבר:",
            prestigeRewardValue: (val) => `+ ${val} מניות זהב`,
            prestigeMinLabel: (val) => `מינימום כסף נדרש למעבר בסניף זה: ${val}`,
            names: [
                "סיטיבנק (סניף מקומי)",
                "אייץ'-אס-בי-סי (סניף פיננסי)",
                "ג'יי פי מורגן (וול סטריט)",
                "גולדמן זקס (אימפריית השקעות)"
            ],
            descs: [
                "הבנק המקומי הראשון שלך. כאן הכל מתחיל.",
                "ענק פיננסי גלובלי. לקוחות עשירים יותר ותנועת כספים מהירה.",
                "מרכז העסקים של וול סטריט. עסקאות ענק, הלוואות מפלצתיות ורווחים אדירים.",
                "האימפריית ההשקעות העולמית. רווחים אגדיים שממלאים את כספות הזהב בשניות."
            ],
            active: "סניף פעיל 🏛",
            travel: "חזור לסניף זה",
            sold: "נמכר 💰",
            sellAndBuild: "מכור והקם סניף!",
            locked: "נעול (פתח קודם סניף קודם)",
            minCash: (val) => `דרישת כסף נוכחית: ${val}`
        },
        missions: {
            clientsTitle: "שירות לקוחות בסניף",
            clientsDesc: (t) => `טפל ב-${t} לקוחות נוספים בסניף`,
            cashTitle: "צבירת הון עצמי",
            cashDesc: (t) => `הגע ליתרת מזומנים כוללת של ${t}`,
            tellerTitle: "שדרוג עמדות כספר",
            tellerDesc: (t, id) => `שדרג את עמדת כספר ${id || 1} לרמה ${t}`,
            guardTitle: "שדרוג מערך אבטחה",
            guardDesc: (t, id) => `שדרג את בלדר ${id || 1} לרמה ${t}`,
            vaultTitle: "הרחבת כספת ראשית",
            vaultDesc: (t) => `שדרג את הכספת הראשית לרמה ${t}`,
            unlock_departmentsTitle: "פתיחת מחלקות חדשות",
            unlock_departmentsDesc: (t) => `פתח ${t} מחלקות בבנק למענה רחב`,
            hire_managersTitle: "גיוס מנהלים בכירים",
            hire_managersDesc: (t) => `גייס ${t} מנהלים שינהלו את הבנק`,
            earn_epsTitle: "יעד רווחיות לשנייה",
            earn_epsDesc: (t) => `הגע לקצב הכנסות של ${t} לשנייה`,
            accumulate_vault_cashTitle: "צבירת כסף בכספת",
            accumulate_vault_cashDesc: (t) => `צבור ${t} במזומנים בתוך הכספת הראשית`,
            gold_sharesTitle: "צבירת מניות זהב",
            gold_sharesDesc: (t) => `צבור ${t} מניות זהב באמצעות Prestige`,
            earn_cashTitle: "צבירת כסף",
            earn_cashDesc: (t) => `הרווח סך של ${t}`,
            serve_rich_vipTitle: "שירות לקוחות VIP",
            serve_rich_vipDesc: (t) => `שרת ${t} לקוחות עשירים או VIP`,
            spend_cashTitle: "השקעת הון בסניף",
            spend_cashDesc: (t) => `השקע סך של ${t} בשדרוגים וגיוס מנהלים`,
            upgrade_managersTitle: "שדרוג מנהלים",
            upgrade_managersDesc: (t) => `שדרג רמות מנהלים ${t} פעמים (מצטבר)`,
            defaultTitle: "משימה מיוחדת",
            defaultDesc: "השלם את יעדי המשימה"
        },
        vaultFullMsg: "הכספת מלאה — רוקן אותה",
        cheatDetectedMsg: "⚠️ זוהתה עריכת שמירה! היתרה אופסה ל-150$ ומניות הזהב ל-0 כעונש.",
        adTitle: "צופה בחסות ממומנת...",
        adSubtitle: "הפרס יינתן בעוד:",
        adCloseBtn: "סגור ❌ (ללא פרס)"
    },
    en: {
        appName: "Bank Empire",
        bankPrefix: "",
        mute: "Mute",
        unmute: "Unmute",
        vaultVolume: "Volume",
        tooltips: {
            adv: "Sponsored marketing campaign to attract clients",
            guard: "Click to send the courier manually",
            vault: "Click to empty the vault"
        },
        cashLabel: "Cash Balance",
        perSecond: "per second",
        sharesLabel: "Golden Shares",
        multiplier: "Multiplier",
        simulatorTitle: "Bank Simulator",
        activeFlow: "Active Cash Flow",
        advTitle: "📢 Ad Campaign",
        advValueOff: "Off",
        advValueOn: "Active Ads",
        guardClickHint: "(Send Guard 👆)",
        vaultTitle: "Main Vault",
        vaultLoading: "Loading data...",
        collectVault: "Collect Vault",
        tabUpgrades: "Counters",
        tabManagers: "Managers",
        tabDepartments: "Depts",
        tabMissions: "Missions 🏆",
        tabBranches: "Branches",
        footerText: "Bank Empire © 2026 - Premium Idle Game. All rights reserved.",
        offlineModalTitle: "Welcome back, CEO!",
        offlineModalText: "Your staff and managers worked hard while you were away and earned profits for the bank!",
        offlineModalBtn: "Collect Profits",
        offlineDoubleBtn: "🎬 Watch ad and get 3x!",
        offlineClaimBtn: "Claim Regular Amount",
        langModalTitle: "Select Language",
        langModalText: "Choose your preferred language:",
        langModalClose: "Close Settings",
        dangerZoneTitle: "Danger Zone ⚠️",
        themeTitle: "Select Background:",
        resetGameBtn: "⚠️ Complete Reset",
        confirmPrestige: (branchName, shares) => `Are you sure you want to sell your branch and start a new one in ${branchName}? You will get +${shares} Golden Shares!`,
        insufficientFunds: "Need Cash",
        maxLevel: "Max Level",
        activeLabel: "Active 🟢",
        lockedLabel: "Locked",
        upgradeLabel: "Upgrade",
        unlockLabel: "Unlock Desk",
        hireLabel: "Hire Manager",
        hiredLabel: "Hired ✔",
        claimReward: "Claim",
        missionCompletedTitle: "🏆 Completed Missions",
        missionCompletedDesc: "Complete official tasks on behalf of the Board of Directors and receive instant cash grants!",
        alertQueueEmpty: "Empty",
        alertQueueFull: "Crowded",
        alertQueueOk: "OK",
        alertQueueLabel: "Queue",
        perMinute: "/min",
        advSuspended: " (Suspended - No cash)",
        tellerLabel: "Teller",
        levelLabel: "Lvl",
        servingClientLabel: "Serving Client",
        collectShortLabel: "Collect",
        guardStates: {
            idle: "Guard waiting in vault...",
            moving_to_tellers: "Guard traveling to collect cash...",
            collecting: "Loading cash bags...",
            moving_to_vault: "Returning to vault with cash...",
            depositing: "Unloading cash in vault..."
        },
        upgrades: {
            tellerTitle: (id, lvl) => `Teller ${id} - Lvl ${lvl}`,
            tellerDesc: "Serves customers and generates piles of cash.",
            tellerSpeed: "Speed",
            tellerCap: "Desk Cap",
            tellerLocked: (id) => `Teller ${id} - [Locked]`,
            tellerLockedDesc: "Unlock an extra desk to boost customer flow.",
            guardTitle: (id, lvl) => `Guard ${id} - Lvl ${lvl}`,
            guardDesc: "Collects cash from desks and transfers to main vault.",
            guardSpeed: "Round Speed",
            guardCap: "Capacity",
            guardLocked: (id) => `Guard ${id} - [Locked]`,
            guardLockedDesc: "Hire another guard to move cash faster.",
            guardUnlockBtn: "Hire Guard",
            vaultTitle: (lvl) => `Main Vault - Lvl ${lvl}`,
            vaultDesc: "Stores all collected cash in the bank.",
            vaultCap: "Storage Volume",
            queueTitle: (lvl) => `Lobby & Queue - Lvl ${lvl}`,
            queueDesc: "Increases lobby waiting capacity for more clients.",
            queueCap: "Queue Capacity",
            queueMaxTitle: "Lobby & Queue - Max Level",
            queueMaxDesc: (cap) => `Queue capacity reached its absolute limit (${cap} clients).`,
            clientsShort: "clients",
            queueUpgradeBtn: "Upgrade Lobby"
        },
        managers: {
            names: {
                customer: "Customer Manager",
                finance: "Finance Manager",
                operations: "Operations Manager",
                service: "Service Manager",
                vip: "VIP Manager",
                marketing: "Marketing Manager",
                logistics: "Logistics Manager",
                risk: "Risk Manager",
                tech: "Tech Manager",
                compliance: "Compliance Manager"
            },
            descs: {
                customer: "+6% Client Speed | +3% Satisfaction (per level)",
                finance: "Auto-collects vault | +5% Bank Yield (per level)",
                operations: "+4% Courier Speed | +3% Teller Speed (per level)",
                service: "+5% Counter Capacity | +4% Base Yield (per level)",
                vip: "+7% Dept Yields | +4% Golden Shares in Prestige (per level)",
                marketing: "+10% Ad Campaign Bonus | +1 Hour Max Offline Time (per level)",
                logistics: "+20% Guard Capacity (per level)",
                risk: "+12% Advanced Dept Income (per level)",
                tech: "+5% EPS | +2 Offline Hours (per level)",
                compliance: "+8% Golden Shares in Prestige (per level)"
            }
        },
        departments: {
            names: [
                "Basic Teller Services",
                "Loans & Mortgages",
                "VIP Private Banking",
                "Stocks & Crypto Trading",
                "\"Creative\" Tax Planning"
            ],
            descLabel: "Base Yield",
            statsLabel: "Adjusted Yield",
            unlock: "Unlock Dept"
        },
        branches: {
            prestigeTitle: "Prestige Mechanics (Golden Shares)",
            prestigeDesc: "Sell your current branch and establish a new one. In return, you receive **Golden Shares** which grant a permanent boost to all future earnings.",
            prestigeBoost: "Each Golden Share grants a permanent +5% boost to earnings in all branches!",
            prestigeRewardLabel: "Golden Shares received on transfer:",
            prestigeRewardValue: (val) => `+ ${val} Shares`,
            prestigeMinLabel: (val) => `Minimum cash required for prestige in this branch: ${val}`,
            names: [
                "Citibank (Local Branch)",
                "HSBC (Financial Branch)",
                "JPMorgan Chase (Wall Street)",
                "Goldman Sachs (Investment Empire)"
            ],
            descs: [
                "Your first local bank branch. This is where it all begins.",
                "A global financial giant. Wealthier clients and rapid cash flow.",
                "The heart of Wall Street business. Massive deals, huge loans, and giant profits.",
                "The ultimate investment empire. Legendary earnings filling golden vaults in seconds."
            ],
            active: "Active Branch 🏛",
            travel: "Return to Branch",
            sold: "Sold 💰",
            sellAndBuild: "Sell & Rebuild!",
            locked: "Locked (Open previous branch first)",
            minCash: (val) => `Current cash requirement: ${val}`
        },
        missions: {
            clientsTitle: "Customer Service in Branch",
            clientsDesc: (t) => `Serve ${t} more clients in the branch`,
            cashTitle: "Capital Accumulation",
            cashDesc: (t) => `Reach a total cash balance of ${t}`,
            tellerTitle: "Upgrade Teller Desks",
            tellerDesc: (t, id) => `Upgrade Teller Desk ${id || 1} to level ${t}`,
            guardTitle: "Upgrade Security System",
            guardDesc: (t, id) => `Upgrade Guard ${id || 1} to level ${t}`,
            vaultTitle: "Expand Main Vault",
            vaultDesc: (t) => `Upgrade the Main Vault to level ${t}`,
            unlock_departmentsTitle: "Open New Departments",
            unlock_departmentsDesc: (t) => `Unlock ${t} departments in the bank`,
            hire_managersTitle: "Recruit Executive Managers",
            hire_managersDesc: (t) => `Hire ${t} managers to manage the bank`,
            earn_epsTitle: "Hourly Profitability Goal",
            earn_epsDesc: (t) => `Reach an earnings rate of ${t} per second`,
            accumulate_vault_cashTitle: "Accumulate Vault Cash",
            accumulate_vault_cashDesc: (t) => `Store ${t} inside the main vault`,
            gold_sharesTitle: "Accumulate Gold Shares",
            gold_sharesDesc: (t) => `Collect ${t} Gold Shares via Prestige`,
            earn_cashTitle: "Accumulate Cash",
            earn_cashDesc: (t) => `Earn a total of ${t}`,
            serve_rich_vipTitle: "VIP Customer Service",
            serve_rich_vipDesc: (t) => `Serve ${t} rich or VIP clients at tellers`,
            spend_cashTitle: "Capital Investment",
            spend_cashDesc: (t) => `Spend a total of ${t} on upgrades and hires`,
            upgrade_managersTitle: "Upgrade Managers",
            upgrade_managersDesc: (t) => `Upgrade manager levels ${t} times (total)`,
            defaultTitle: "Special Mission",
            defaultDesc: "Complete the mission objectives"
        },
        vaultFullMsg: "Vault is full — empty it",
        cheatDetectedMsg: "⚠️ Save editing detected! Balance reset to $150 and golden shares to 0 as penalty.",
        adTitle: "Watching Sponsored Ad...",
        adSubtitle: "Reward unlocks in:",
        adCloseBtn: "Close ❌ (No Reward)"
    },
    es: {
        appName: "Imperio Bancario",
        bankPrefix: "",
        mute: "Silenciar",
        unmute: "Desactivar silencio",
        vaultVolume: "Volumen",
        tooltips: {
            adv: "Campaña de marketing patrocinada para atraer clientes",
            guard: "Haz clic para enviar al guardia manualmente",
            vault: "Haz clic para vaciar la bóveda"
        },
        cashLabel: "Saldo de Efectivo",
        perSecond: "por segundo",
        sharesLabel: "Acciones de Oro",
        multiplier: "Multiplicador",
        simulatorTitle: "Simulador Bancario",
        activeFlow: "Flujo Activo",
        advTitle: "📢 Campaña de Publicidad",
        advValueOff: "Apagado",
        advValueOn: "Publicidad Activa",
        guardClickHint: "(Enviar Guardia 👆)",
        vaultTitle: "Bóveda Principal",
        vaultLoading: "Cargando datos...",
        collectVault: "Cobrar Bóveda",
        tabUpgrades: "Cajeros",
        tabManagers: "Gerentes",
        tabDepartments: "Deptos",
        tabMissions: "Misiones 🏆",
        tabBranches: "Sucursales",
        footerText: "Imperio Bancario © 2026 - Juego Idle Premium. Todos los derechos reservados.",
        offlineModalTitle: "¡Bienvenido de nuevo, CEO!",
        offlineModalText: "¡Tu personal y gerentes trabajaron duro mientras estabas fuera y obtuvieron ganancias para el banco!",
        offlineModalBtn: "Cobrar Ganancias",
        offlineDoubleBtn: "🎬 ¡Ver anuncio y obtener 3x!",
        offlineClaimBtn: "Reclamar Monto Regular",
        langModalTitle: "Seleccionar Idioma",
        langModalText: "Elige tu idioma preferido:",
        langModalClose: "Cerrar Ajustes",
        dangerZoneTitle: "Zona de Peligro ⚠️",
        themeTitle: "Seleccionar Fondo:",
        resetGameBtn: "⚠️ Reinicio Completo",
        confirmPrestige: (branchName, shares) => `¿Estás seguro de que quieres vender tu sucursal y abrir una nueva en ${branchName}? ¡Recibirás +${shares} Acciones de Oro!`,
        insufficientFunds: "Falta Efectivo",
        maxLevel: "Nivel Máximo",
        activeLabel: "Activo 🟢",
        lockedLabel: "Bloqueado",
        upgradeLabel: "Mejorar",
        unlockLabel: "Desbloquear",
        hireLabel: "Contratar",
        hiredLabel: "Contratado ✔",
        claimReward: "Reclamar",
        missionCompletedTitle: "🏆 Misiones Completadas",
        missionCompletedDesc: "¡Completa tareas oficiales en nombre de la Junta Directiva y recibe subsidios de efectivo al instante!",
        alertQueueEmpty: "Fila Vacía",
        alertQueueFull: "Fila Llena",
        alertQueueOk: "OK",
        alertQueueLabel: "Fila",
        perMinute: "/min",
        advSuspended: " (Suspendido - Sin efectivo)",
        tellerLabel: "Cajero",
        levelLabel: "Nivel",
        servingClientLabel: "Atendiendo Cliente",
        collectShortLabel: "Cobrar",
        guardStates: {
            idle: "Guardia esperando en bóveda...",
            moving_to_tellers: "Guardia viajando a cobrar efectivo...",
            collecting: "Cargando bolsas de dinero...",
            moving_to_vault: "Regresando a bóveda con efectivo...",
            depositing: "Descargando efectivo en bóveda..."
        },
        upgrades: {
            tellerTitle: (id, lvl) => `Cajero ${id} - Nivel ${lvl}`,
            tellerDesc: "Atiende a los clientes y genera montones de efectivo.",
            tellerSpeed: "Velocidad",
            tellerCap: "Cap. Escritorio",
            tellerLocked: (id) => `Cajero ${id} - [Bloqueado]`,
            tellerLockedDesc: "Desbloquea un cajero adicional para aumentar el flujo de clientes.",
            guardTitle: (id, lvl) => `Guardia ${id} - Nivel ${lvl}`,
            guardDesc: "Recoge efectivo de las cajas y lo transfiere a la bóveda.",
            guardSpeed: "Tiempo Ronda",
            guardCap: "Capacidad",
            guardLocked: (id) => `Guardia ${id} - [Bloqueado]`,
            guardLockedDesc: "Contrata otro guardia para mover el efectivo más rápido.",
            guardUnlockBtn: "Contratar Guardia",
            vaultTitle: (lvl) => `Bóveda Principal - Nivel ${lvl}`,
            vaultDesc: "Guarda todo el efectivo recolectado en el banco.",
            vaultCap: "Volumen Almacenamiento",
            queueTitle: (lvl) => `Lobby y Fila - Nivel ${lvl}`,
            queueDesc: "Aumenta la capacidad de espera en la fila para más clientes.",
            queueCap: "Capacidad Fila",
            queueMaxTitle: "Lobby y Fila - Nivel Máximo",
            queueMaxDesc: (cap) => `La capacidad de la fila ha llegado a su límite máximo (${cap} clientes).`,
            clientsShort: "clientes",
            queueUpgradeBtn: "Mejorar Lobby"
        },
        managers: {
            names: {
                customer: "Gerente de Clientes",
                finance: "Gerente de Finanzas",
                operations: "Gerente de Operaciones",
                service: "Gerente de Servicio",
                vip: "Gerente VIP",
                marketing: "Gerente de Marketing",
                logistics: "Gerente de Logística",
                risk: "Gerente de Riesgos",
                tech: "Gerente de Tecnología",
                compliance: "Gerente de Cumplimiento"
            },
            descs: {
                customer: "+6% Vel. de Clientes | +3% Satisfacción (por nivel)",
                finance: "Bóveda automática | +5% Rendimiento (por nivel)",
                operations: "+4% Vel. de Guardias | +3% Vel. de Cajeros (por nivel)",
                service: "+5% Capacidad de Cajeros | +4% Rend. Base (por nivel)",
                vip: "+7% Rend. de Deptos | +4% Acciones de Oro (por nivel)",
                marketing: "+10% Bono de Publicidad | +1 Hora de Tiempo Offline (por nivel)",
                logistics: "+20% Capacidad de Guardia (por nivel)",
                risk: "+12% Ingresos de Deptos Avanzados (por nivel)",
                tech: "+5% EPS | +2 Horas Offline (por nivel)",
                compliance: "+8% Acciones de Oro en Prestigio (por nivel)"
            }
        },
        departments: {
            names: [
                "Servicios Básicos de Caja",
                "Préstamos e Hipotecas",
                "Banca Privada VIP",
                "Acciones y Criptomonedas",
                "Planificación Fiscal \"Creativa\""
            ],
            descLabel: "Rendimiento base",
            statsLabel: "Rendimiento ajustado",
            unlock: "Desbloquear"
        },
        branches: {
            prestigeTitle: "Mecánica de Prestigio (Acciones de Oro)",
            prestigeDesc: "Vende tu sucursal actual y establece una nueva. A cambio, recibes **Acciones de Oro** que otorgan un impulso permanente a todas las ganancias futuras.",
            prestigeBoost: "¡Cada Acción de Oro otorga un impulso permanente de +5% a las ganancias en todas las sucursales!",
            prestigeRewardLabel: "Acciones de Oro obtenidas en el traslado:",
            prestigeRewardValue: (val) => `+ ${val} Acciones`,
            prestigeMinLabel: (val) => `Mínimo de efectivo requerido para el prestigio en esta sucursal: ${val}`,
            names: [
                "Citibank (Sucursal Local)",
                "HSBC (Sucursal Financiera)",
                "JPMorgan Chase (Wall Street)",
                "Goldman Sachs (Imperio de Inversión)"
            ],
            descs: [
                "Tu primera sucursal bancaria local. Aquí es donde comienza todo.",
                "Un gigante financiero global. Clientes más ricos y un flujo de caja rápido.",
                "El corazón de los negocios de Wall Street. Acuerdos masivos, préstamos enormes y ganancias gigantes.",
                "El imperio definitivo de la inversión. Ganancias legendarias que llenan las bóvedas de oro en segundos."
            ],
            active: "Sucursal Activa 🏛",
            travel: "Volver a Sucursal",
            sold: "Vendido 💰",
            sellAndBuild: "¡Vender y Reconstruir!",
            locked: "Bloqueado (Abre la sucursal anterior primero)",
            minCash: (val) => `Requisito de efectivo actual: ${val}`
        },
        missions: {
            clientsTitle: "Atención al Cliente en Sucursal",
            clientsDesc: (t) => `Atiende a ${t} clientes más en la sucursal`,
            cashTitle: "Acumulación de Capital",
            cashDesc: (t) => `Alcanza un saldo de efectivo total de ${t}`,
            tellerTitle: "Mejorar Escritorio de Cajero",
            tellerDesc: (t, id) => `Mejora el escritorio del cajero ${id || 1} al nivel ${t}`,
            guardTitle: "Mejorar Seguridad",
            guardDesc: (t, id) => `Mejora al guardia ${id || 1} al nivel ${t}`,
            vaultTitle: "Mejorar Bóveda Principal",
            vaultDesc: (t) => `Mejora la bóveda principal al nivel ${t}`,
            unlock_departmentsTitle: "Abrir Nuevos Departamentos",
            unlock_departmentsDesc: (t) => `Desbloquea ${t} departamentos en el banco`,
            hire_managersTitle: "Reclutar Gerentes Ejecutivos",
            hire_managersDesc: (t) => `Contrata a ${t} gerentes para administrar el banco`,
            earn_epsTitle: "Objetivo de Ganancias por Segundo",
            earn_epsDesc: (t) => `Alcanza un ritmo de ganancias de ${t} por segundo`,
            accumulate_vault_cashTitle: "Acumular Efectivo en Bóveda",
            accumulate_vault_cashDesc: (t) => `Guarda ${t} de efectivo en la bóveda principal`,
            gold_sharesTitle: "Acumular Acciones de Oro",
            gold_sharesDesc: (t) => `Acumula ${t} Acciones de Oro mediante prestigio`,
            earn_cashTitle: "Acumular Efectivo",
            earn_cashDesc: (t) => `Gana un total de ${t}`,
            serve_rich_vipTitle: "Servicio a Clientes VIP",
            serve_rich_vipDesc: (t) => `Atiende a ${t} clientes ricos o VIP`,
            spend_cashTitle: "Inversión de Capital",
            spend_cashDesc: (t) => `Gasta un total de ${t} en mejoras y contrataciones`,
            upgrade_managersTitle: "Mejorar Gerentes",
            upgrade_managersDesc: (t) => `Mejora los niveles de gerentes ${t} veces (total)`,
            defaultTitle: "Misión Especial",
            defaultDesc: "Completa los objetivos de la misión"
        },
        vaultFullMsg: "Bóveda llena — vacíala",
        cheatDetectedMsg: "⚠️ ¡Edición de guardado detectada! El saldo se restableció a $150 y las acciones de oro a 0 como penalización.",
        adTitle: "Viendo anuncio patrocinado...",
        adSubtitle: "La recompensa se desbloquea en:",
        adCloseBtn: "Cerrar ❌ (Sin recompensa)"
    },
    ru: {
        appName: "Банковская Империя",
        bankPrefix: "",
        mute: "Выключить звук",
        unmute: "Включить звук",
        vaultVolume: "Объем",
        tooltips: {
            adv: "Рекламная кампания для привлечения клиентов",
            guard: "Нажмите, чтобы отправить инкассатора вручную",
            vault: "Нажмите, чтобы очистить сейф"
        },
        cashLabel: "Баланс наличных",
        perSecond: "в секунду",
        sharesLabel: "Золотые акции",
        multiplier: "Множитель",
        simulatorTitle: "Симулятор Банка",
        activeFlow: "Активный поток",
        advTitle: "📢 Рекламная кампания",
        advValueOff: "Выкл",
        advValueOn: "Реклама активна",
        guardClickHint: "(Отправить копа 👆)",
        vaultTitle: "Главный Сейф",
        vaultLoading: "Загрузка данных...",
        collectVault: "Очистить сейф",
        tabUpgrades: "Кассы",
        tabManagers: "Кадры",
        tabDepartments: "Отделы",
        tabMissions: "Миссии 🏆",
        tabBranches: "Филиалы",
        footerText: "Банковская Империя © 2026 - Премиум Idle Игра. Все права защищены.",
        offlineModalTitle: "С возвращением, Директор!",
        offlineModalText: "Ваша команда и менеджеры усердно трудились в ваше отсутствие и накопили прибыль для банка!",
        offlineModalBtn: "Забрать прибыль",
        offlineDoubleBtn: "🎬 Посмотреть рекламу и получить 3x!",
        offlineClaimBtn: "Забрать обычную сумму",
        langModalTitle: "Выбор Языка / Choose Language",
        langModalText: "Выберите предпочитаемый язык интерфейса / Please select language:",
        langModalClose: "Закрыть настройки / Close",
        dangerZoneTitle: "Опасная Зона ⚠️",
        themeTitle: "Выбрать Фон:",
        resetGameBtn: "⚠️ Полный Сброс",
        confirmPrestige: (branchName, shares) => `Вы уверены, что хотите продать филиал и открыть новый в ${branchName}? Вы получите +${shares} Золотых акций!`,
        insufficientFunds: "Нужны деньги",
        maxLevel: "Макс. Уровень",
        activeLabel: "Активно 🟢",
        lockedLabel: "Закрыто",
        upgradeLabel: "Улучшить",
        unlockLabel: "Открыть кассу",
        hireLabel: "Нанять",
        hiredLabel: "Нанят ✔",
        claimReward: "Забрать",
        missionCompletedTitle: "🏆 Выполненные миссии",
        missionCompletedDesc: "Выполняйте официальные поручения Совета директоров и получайте мгновенные денежные гранты!",
        alertQueueEmpty: "Пустая очередь",
        alertQueueFull: "Много людей",
        alertQueueOk: "Норма",
        alertQueueLabel: "Очередь",
        perMinute: "/мин",
        advSuspended: " (Приостановлено - Нет денег)",
        tellerLabel: "Кассир",
        levelLabel: "Ур",
        servingClientLabel: "Обслуживание",
        collectShortLabel: "Сбор",
        guardStates: {
            idle: "Охранник ожидает в сейфе...",
            moving_to_tellers: "Инкассатор едет собирать наличные...",
            collecting: "Загрузка мешков с деньгами...",
            moving_to_vault: "Возврат в сейф с деньгами...",
            depositing: "Разгрузка денег в сейфе..."
        },
        upgrades: {
            tellerTitle: (id, lvl) => `Кассир ${id} - Ур. ${lvl}`,
            tellerDesc: "Обслуживает клиентов и складывает стопки денег.",
            tellerSpeed: "Скорость",
            tellerCap: "Емкость стола",
            tellerLocked: (id) => `Кассир ${id} - [Закрыто]`,
            tellerLockedDesc: "Откройте дополнительную кассу, чтобы увеличить поток клиентов.",
            guardTitle: (id, lvl) => `Инкассатор ${id} - Ур. ${lvl}`,
            guardDesc: "Собирает деньги с касс и перевозит в главный сейф.",
            guardSpeed: "Время круга",
            guardCap: "Вместимость",
            guardLocked: (id) => `Инкассатор ${id} - [Закрыто]`,
            guardLockedDesc: "Наймите дополнительного инкассатора для быстрого сбора средств.",
            guardUnlockBtn: "Нанять копа",
            vaultTitle: (lvl) => `Главный Сейф - Ур. ${lvl}`,
            vaultDesc: "Хранит все собранные наличные средства банка.",
            vaultCap: "Объем хранилища",
            queueTitle: (lvl) => `Вестибюль и Очередь - Ур. ${lvl}`,
            queueDesc: "Увеличивает вместимость вестибюля ожидания для клиентов.",
            queueCap: "Вместимость очереди",
            queueMaxTitle: "Вестибюль и Очередь - Макс. Уровень",
            queueMaxDesc: (cap) => `Вместимость очереди достигла абсолютного максимума (${cap} клиентов).`,
            clientsShort: "клиентов",
            queueUpgradeBtn: "Улучшить вестибюль"
        },
        managers: {
            names: {
                customer: "Менеджер по клиентам",
                finance: "Финансовый менеджер",
                operations: "Операционный менеджер",
                service: "Менеджер по сервису",
                vip: "VIP менеджер",
                marketing: "Менеджер по маркетингу",
                logistics: "Менеджер по логистике",
                risk: "Менеджер по рискам",
                tech: "Технический менеджер",
                compliance: "Менеджер по соответствию"
            },
            descs: {
                customer: "+6% Скорость клиентов | +3% Удовлетворенность (за ур.)",
                finance: "Авто-сбор сейфа | +5% Доход банка (за уровень)",
                operations: "+4% Скорость инкасс. | +3% Скор. кассиров (за ур.)",
                service: "+5% Вместимость касс | +4% Базовый доход (за ур.)",
                vip: "+7% Доход отделов | +4% Золотые акции при престиже (за ур.)",
                marketing: "+10% Бонус рекламы | +1 час оффлайн времени (за ур.)",
                logistics: "+20% Вместимость охраны (за уровень)",
                risk: "+12% Доход продвинутых отделов (за уровень)",
                tech: "+5% EPS | +2 часа оффлайн (за уровень)",
                compliance: "+8% Золотые акции в престиже (за уровень)"
            }
        },
        departments: {
            names: [
                "Базовые Кассовые Услуги",
                "Кредиты и Ипотека",
                "VIP Частный Банкинг",
                "Акции и Криптовалюта",
                "\"Креативное\" Налоговое Планирование"
            ],
            descLabel: "Базовый доход",
            statsLabel: "Скорректированный доход",
            unlock: "Открыть"
        },
        branches: {
            prestigeTitle: "Механика Престижа (Золотые акции)",
            prestigeDesc: "Продайте текущий филиал и откройте новый. Взамен вы получите **Золотые акции**, которые дают постоянный буст ко всем будущим доходам.",
            prestigeBoost: "Каждая Золотая акция дает постоянный буст +5% к доходу во всех филиалах!",
            prestigeRewardLabel: "Золотые акции к получению при переезде:",
            prestigeRewardValue: (val) => `+ ${val} шт.`,
            prestigeMinLabel: (val) => `Минимум наличных для престижа в этом филиале: ${val}`,
            names: [
                "Ситибанк (Местный филиал)",
                "HSBC (Финансовый филиал)",
                "JPMorgan Chase (Уолл-стрит)",
                "Goldman Sachs (Инвестиционная империя)"
            ],
            descs: [
                "Ваш первый местный филиал Ситибанка. Здесь всё начинается.",
                "Глобальный финансовый гигант HSBC. Клиенты здесь богаче и транзакции проходят быстрее.",
                "Сердце бизнеса Уолл-стрит от JPMorgan Chase. Огромные кредиты и многомиллионные сделки.",
                "Легендарная инвестиционная империя Goldman Sachs. Колоссальная прибыль, заполняющая золотые сейфы."
            ],
            active: "Активный филиал 🏛",
            travel: "Вернуться в филиал",
            sold: "Продано 💰",
            sellAndBuild: "Продать и Переехать!",
            locked: "Закрыто (Сначала откройте предыдущий филиал)",
            minCash: (val) => `Текущее требование капитала: ${val}`
        },
        missions: {
            clientsTitle: "Обслуживание клиентов в филиале",
            clientsDesc: (t) => `Обслужите еще ${t} клиентов в филиале`,
            cashTitle: "Накопление капитала",
            cashDesc: (t) => `Достигните общего баланса наличных в размере ${t}`,
            tellerTitle: "Улучшение рабочих мест кассиров",
            tellerDesc: (t, id) => `Улучшите кассу ${id || 1} до уровня ${t}`,
            guardTitle: "Улучшение службы безопасности",
            guardDesc: (t, id) => `Улучшите инкассатора ${id || 1} до уровня ${t}`,
            vaultTitle: "Расширение главного сейфа",
            vaultDesc: (t) => `Улучшите главный сейф до уровня ${t}`,
            unlock_departmentsTitle: "Открытие новых отделов",
            unlock_departmentsDesc: (t) => `Откройте ${t} отделов в банке`,
            hire_managersTitle: "Наем топ-менеджеров",
            hire_managersDesc: (t) => `Наймите ${t} менеджеров для управления банком`,
            earn_epsTitle: "Цель по доходу в секунду",
            earn_epsDesc: (t) => `Достигните дохода ${t} в секунду`,
            accumulate_vault_cashTitle: "Накопление денег в сейфе",
            accumulate_vault_cashDesc: (t) => `Соберите ${t} наличных в главном сейфе`,
            gold_sharesTitle: "Накопление золотых акций",
            gold_sharesDesc: (t) => `Накопите ${t} золотых акций через престиж`,
            earn_cashTitle: "Накопление наличных",
            earn_cashDesc: (t) => `Заработайте в общей сложности ${t}`,
            serve_rich_vipTitle: "Обслуживание VIP-клиентов",
            serve_rich_vipDesc: (t) => `Обслужите ${t} богатых или VIP-клиентов`,
            spend_cashTitle: "Инвестиции в банк",
            spend_cashDesc: (t) => `Потратьте в общей сложности ${t} на улучшения и наем`,
            upgrade_managersTitle: "Улучшение менеджеров",
            upgrade_managersDesc: (t) => `Повысьте уровни менеджеров ${t} раз (всего)`,
            defaultTitle: "Специальная миссия",
            defaultDesc: "Выполните задачи миссии"
        },
        vaultFullMsg: "Сейф переполнен — очистите его",
        cheatDetectedMsg: "⚠️ Обнаружено изменение сохранений! Баланс сброшен до $150 и золотые акции до 0 в качестве наказания.",
        adTitle: "Просмотр спонсорской рекламы...",
        adSubtitle: "Награда разблокируется через:",
        adCloseBtn: "Закрыть ❌ (Без награды)"
    }
};

// Extend translations dynamically for advanced features
Object.assign(translations.he, {
    boostBtn: "⚡ בוסט פי 2",
    boostModalTitle: "🎬 מאיץ הכנסות כפול (2x BOOST)",
    boostModalText: "צפה בסרטון פרסומת קצר כדי להפעיל מאיץ הכנסות פי 2 לכלל פעילות הבנק למשך 4 שעות! ניתן לצבור זמן צפייה (עד 8 שעות).",
    boostActive: (time) => `⚡ פעיל: ${time}`,
    boostExpired: "⚡ בוסט פי 2",
    goldTotalEffect: "האפקט הכולל שלך",
    goldBranchProfits: "רווחים בסניפים",
    goldCourierSpeed: "מהירות שליחים",
    goldStartingCapital: "הון התחלתי",
    goldGrandBonus: (pct) => `בונוס כולל מכל שדרוגי היוקרה: <span class="gold-grand-bonus-val">+${pct}% לרווחים בכל הסניפים ⬆</span>`,
    vaultSubtitle: "הכנסה פסיבית מהכספת הראשית",
    vaultYieldTitle: "רווח לשעה",
    vaultYieldSub: "מהסניף שלך",
    vaultCapLabel: "קיבולת כספת",
    vaultProgressLabel: (pct) => `${pct}% מילוי כספת:`,
    vaultInfoMsg: "הכספת הראשית מאחסנת את כל המזומנים של הבנק. שדרג אותה כדי להגדיל את הקיבולת שלה. אם היא תתמלא, הבלדרים לא יוכלו לפרוק בה כסף והפעילות תיעצר!",
    goldShopTitle: "🏛️ חנות שדרוגי יוקרה (Prestige Shop)",
    goldShopDesc: "רכוש נכסי קבע המשתמרים בין איפוסים בעזרת מניות הזהב שלך:",
    goldUpgrades: {
        startingCash: {
            title: "💵 הון התחלתי",
            desc: (lvl, nextVal) => `התחל כל סבב עם הון עצמי גבוה יותר. (רמה ${lvl}/4 -> התחלה עם $${nextVal})`
        },
        guardSpeed: {
            title: "👮 בלדרות פדרלית",
            desc: (lvl) => `בונוס מהירות קבוע של +10% לבלדרים לכל רמה. (רמה ${lvl}/5)`
        },
        premiumYield: {
            title: "📈 שירות לקוחות יוקרתי",
            desc: (lvl) => `שפר רווחי כספרים ב-+10% קבוע לכל רמה. (רמה ${lvl}/5)`
        },
        shareEfficiency: {
            title: "🪙 תשואת מניות מוגברת",
            desc: (lvl) => `הגדל את הערך של כל מניית זהב ב-+1% קבוע לכל רמה. (רמה ${lvl}/4)`
        },
        offlineEarnings: {
            title: "💤 משמרות ארוכות",
            desc: (lvl) => `הארך את זמן איסוף המזומנים מחוץ למשחק ב-+2 שעות לכל רמה. (רמה ${lvl}/5)`
        },
        tellerCapacityBoost: {
            title: "👔 תוכנה מתקדמת",
            desc: (lvl) => `תוספת קבועה של +10% לקיבולת הכספרים לכל רמה. (רמה ${lvl}/5)`
        },
        vaultCapacityBoost: {
            title: "🏦 אחסון דחוס",
            desc: (lvl) => `תוספת קבועה של +10% לקיבולת הכספת לכל רמה. (רמה ${lvl}/5)`
        },
        eventBonus: {
            title: "🎩 יח\"צ כריזמטי",
            desc: (lvl) => `תוספת קבועה של +20% למזומנים מכל האירועים האקראיים לכל רמה. (רמה ${lvl}/5)`
        },
        managerDiscount: {
            title: "📉 הכשרת מנהלים",
            desc: (lvl) => `מפחית את עלויות השדרוג של כל המנהלים ב-5% לכל רמה. (רמה ${lvl}/4)`
        }
    },
    managerLevelLabel: (lvl) => `רמה ${lvl}/5`,
    managerUpgradeCost: (cost) => `שדרג מנהל: ${cost}`,
    managerSkillsTitle: "התמחות מיוחדת",
    managerSkillSelected: (skillName) => `התמחות: ${skillName}`,
    managerSkillA: "התמחות א'",
    managerSkillB: "התמחות ב'",
    managerSkillReset: "איפוס התמחות",
    managerSkillResetCost: "איפוס ($5,000)",
    managerSkillResetAd: "🎬 חינם",
    managerSkills: {
        teller: {
            speed: { name: "שירות מהיר", desc: "קיצור זמן השירות בכספרים ב-10%" },
            capacity: { name: "דלפק רחב", desc: "הגדלת קיבולת המזומנים של הדלפק ב-15%" }
        },
        guard: {
            speed: { name: "ריצה מהירה", desc: "זמן סבב של הבלדרים מתקצר ב-10%" },
            capacity: { name: "סבל מקצועי", desc: "כושר נשיאת המזומנים של הבלדר גדל ב-20%" }
        },
        vault: {
            investment: { name: "ניהול תיקים", desc: "ריבית השקעות של +5% לכלל רווחי הבנק" },
            tax: { name: "אופטימיזציית מס", desc: "הנחה של 15% על עלויות שדרוגי כספרים" }
        }
    },
    prestigeRegularBtn: "איפוס רגיל",
    prestigeAdBtn: (shares) => `🎬 שלש ל-${shares} מניות!`,
    prestigeCancelBtn: "ביטול",
    prestigeRewardLabel: "מניות זהב שתקבל:",
    analyticsTitle: "📊 דוח מדדים ואנליטיקה",
    analyticsTotalEps: "סך רווח ממוצע לשנייה (EPS):",
    analyticsVaultUtil: "ניצולת נפח הכספת:",
    analyticsTellersTitle: "פירוט תפוקת כספרים",
    analyticsTellerEps: (id, eps) => `כספר ${id}: ${eps} לשנייה`,
    analyticsBottlenecksTitle: "זיהוי צווארי בקבוק",
    analyticsNoBottlenecks: "כל המערכות עובדות בסנכרון מעולה! 🟢",
    analyticsWarningVaultFull: "⚠️ הכספת מלאה! כספים לא נאספים לתקציב.",
    analyticsWarningQueueFull: "⚠️ תור הלקוחות עמוס! לקוחות עלולים להתייאש.",
    analyticsWarningGuardsSlow: "⚠️ קצב בלדרים איטי! כסף מצטבר בדלפקים.",
    analyticsWarningTellersSlow: "⚠️ שירות כספרים איטי! התור לא מתקדם.",
    analyticsCloseBtn: "סגור דוח",
    eventEmergencyAlert: "📢 אירוע חירום בבנק!",
    eventChooseAction: "בחר כיצד לפעול:",
    events: {
        crowd: {
            title: "עומס לקוחות פתאומי!",
            desc: "קהל גדול הגיע לבנק והתור ארוך מאוד. המנהלת רחלי זקוקה להחלטה מהירה.",
            optA: (cost) => `שכור צוות סדרנים (${cost})`,
            optADesc: "הרחב את התור ב-15 מקומות והכפל את מהירות הכספרים למשך 2 דקות!",
            optB: "אל תעשה כלום (חינם)",
            optBDesc: "3 לקוחות עוזבים בכעס (מפחית את העומס)",
            optC: "🎬 גיוס צוות חירום (פרסומת)",
            optCDesc: "מנקה את כל התור מיידית ומעניק פי 5.0 רווח עליהם"
        },
        security: {
            title: "התראת אבטחה בכספת!",
            desc: "מערכות האבטחה מדווחות על פעילות חשודה ליד הכספת הראשית. אלון מדווח על סכנה.",
            optA: (cost) => `גייס קבלן אבטחה פרטי (${cost})`,
            optADesc: "מניעת הסיכון + מענק מוניטין מיידי של 5 דקות רווח לשנייה!",
            optB: "קח את הסיכון (חינם)",
            optBDesc: "סיכון 50% לאיבוד 10% מכסף הכספת, או 50% להדיפה וקבלת מענק ביטוחי של 5% מהמזומן!",
            optC: "🎬 סגר פדרלי אקטיבי (פרסומת)",
            optCDesc: (amt) => `הגנה מיידית על הכספת ומענק אבטחה פדרלי של ${amt}`
        },
        rescue: {
            title: "מענק סיוע ממשלתי!",
            desc: "הבנק שלך נקלע לקשיים כספיים קיצוניים ותקוע ללא תזרים. הממשלה מציעה סיוע.",
            optA: (amt) => `🎬 קבל מענק חירום (${amt}) (פרסומת)`,
            optADesc: (amt) => `קבל ${amt} במזומן באופן מיידי כדי להמשיך לתפקד`,
            optB: "סרב לסיוע (חינם)",
            optBDesc: "נסה להתאושש בכוחות עצמך"
        },
        rush_hours: {
            title: "משמרת טורבו בסניף!",
            desc: "הכספרים שלך מרגישים נמרצים ומלאי מוטיבציה היום. מנהלת השירות מציעה להגביר את הקצב!",
            optA: (cost) => `שלם בונוס לעובדים (${cost})`,
            optADesc: "הכספרים יעבדו במהירות פי 4 למשך 2 דקות שלמות!",
            optB: "המשך כרגיל (חינם)",
            optBDesc: "קצב עבודה רגיל ללא שינוי",
            optC: "🎬 הפעל משמרת טורבו פי 10! (פרסומת)",
            optCDesc: "הכספרים יעבדו במהירות מטורפת פי 10 למשך 2 דקות!"
        },
        investor: {
            title: "הצעה ממשקיע חיצוני!",
            desc: "משקיע מיליונר מעוניין להזרים הון לבנק שלך או לממן הכשרה מקצועית למנהלים שלך בתמורה לפרסום.",
            optA: (cash) => `🎬 קבל מענק השקעה של ${cash} (פרסומת)`,
            optADesc: "הזרמת הון מיידית לקופת הבנק",
            optBUpgrade: (name, nextLvl) => `🎬 הכשרה מהירה: שדרג את ${name} לרמה ${nextLvl} (פרסומת)`,
            optBShares: "🎬 מענק זהב: קבל 5 מניות זהב (פרסומת)",
            optBDesc: "שדרוג חינם ללא עלות במזומן",
            optC: "סרב להצעה",
            optCDesc: "המשך לנהל את הבנק כרגיל"
        }
    },
    bulkLabel: "מצב שדרוג:",
    synergiesTitle: "סינרגיות מנהלים",
    synergiesDesc: "הפעל שילובי מיומנויות ייחודיים בין מנהלים במחלקות סמוכות כדי לפתוח בונוסים עוצמתיים.",
    synergiesList: {
        operational: {
            name: "יעילות תפעולית (רחלי + אלון)",
            desc: "שירות מהיר + ריצה מהירה ➔ כספרים ובלדרים עובדים ב-10% מהר יותר."
        },
        logistics: {
            name: "לוגיסטיקה כבדה (רחלי + אלון)",
            desc: "דלפק רחב + סבל מקצועי ➔ קיבולת כספרים ובלדרים גדלה ב-10% נוספים."
        },
        financial: {
            name: "פיננסית סמוכה (רחלי + דן)",
            desc: "שירות מהיר + ניהול תיקים ➔ בונוס של +10% לכלל הכנסות הבנק."
        }
    }
});

Object.assign(translations.en, {
    boostBtn: "⚡ BOOST x2",
    boostModalTitle: "🎬 Double Income Boost (2x BOOST)",
    boostModalText: "Watch a short sponsored ad to double all income for 4 hours! You can stack watch time up to 8 hours.",
    boostActive: (time) => `⚡ Active: ${time}`,
    boostExpired: "⚡ BOOST x2",
    goldTotalEffect: "Your Total Effect",
    goldBranchProfits: "Branch Profits",
    goldCourierSpeed: "Courier Speed",
    goldStartingCapital: "Starting Capital",
    goldGrandBonus: (pct) => `Total boost from prestige upgrades: <span class="gold-grand-bonus-val">+${pct}% to all branch profits ⬆</span>`,
    vaultSubtitle: "Passive income from the main vault",
    vaultYieldTitle: "Hourly Profit",
    vaultYieldSub: "from your branch",
    vaultCapLabel: "Vault Capacity",
    vaultProgressLabel: (pct) => `Vault Fill: ${pct}%`,
    vaultInfoMsg: "The main vault stores all bank cash. Upgrade it to increase capacity. If it gets full, couriers cannot deposit cash and progress will stall!",
    goldShopTitle: "🏛️ Prestige Shop (Golden Upgrades)",
    goldShopDesc: "Purchase permanent assets using your Golden Shares:",
    goldUpgrades: {
        startingCash: {
            title: "💵 Starting Cash",
            desc: (lvl, nextVal) => `Start each round with more cash. (Lvl ${lvl}/4 -> Starts with $${nextVal})`
        },
        guardSpeed: {
            title: "👮 Federal Escort",
            desc: (lvl) => `Permanent +10% speed boost for guards per level. (Lvl ${lvl}/5)`
        },
        premiumYield: {
            title: "📈 Premium Customer Service",
            desc: (lvl) => `Permanent +10% income boost for tellers per level. (Lvl ${lvl}/5)`
        },
        shareEfficiency: {
            title: "🪙 Enhanced Share Yield",
            desc: (lvl) => `Increase the yield of each Golden Share by +1% per level. (Lvl ${lvl}/4)`
        },
        offlineEarnings: {
            title: "💤 Longer Shifts",
            desc: (lvl) => `Increase maximum offline earning time by +2 hours per level. (Lvl ${lvl}/5)`
        },
        tellerCapacityBoost: {
            title: "👔 Advanced Software",
            desc: (lvl) => `Permanent +10% capacity for tellers per level. (Lvl ${lvl}/5)`
        },
        vaultCapacityBoost: {
            title: "🏦 Compressed Storage",
            desc: (lvl) => `Permanent +10% capacity for the vault per level. (Lvl ${lvl}/5)`
        },
        eventBonus: {
            title: "🎩 Charismatic PR",
            desc: (lvl) => `Permanent +20% rewards from all random events per level. (Lvl ${lvl}/5)`
        },
        managerDiscount: {
            title: "📉 Corporate Training",
            desc: (lvl) => `Reduces manager upgrade costs by -5% per level. (Lvl ${lvl}/4)`
        }
    },
    managerLevelLabel: (lvl) => `Lvl ${lvl}/5`,
    managerUpgradeCost: (cost) => `Upgrade Mgr: ${cost}`,
    managerSkillsTitle: "Specialization Branch",
    managerSkillSelected: (skillName) => `Special: ${skillName}`,
    managerSkillA: "Path A",
    managerSkillB: "Path B",
    managerSkillReset: "Reset Path",
    managerSkillResetCost: "Reset ($5,000)",
    managerSkillResetAd: "🎬 Free",
    managerSkills: {
        teller: {
            speed: { name: "Fast Service", desc: "Reduces teller processing duration by 10%" },
            capacity: { name: "Wide Counter", desc: "Increases teller desk cash capacity by 15%" }
        },
        guard: {
            speed: { name: "Fast Sprint", desc: "Reduces guard transit duration by 10%" },
            capacity: { name: "Heavy Loader", desc: "Increases guard carrying capacity by 20%" }
        },
        vault: {
            investment: { name: "Portfolio Mgr", desc: "Investment yield of +5% on all bank earnings" },
            tax: { name: "Tax Optimizer", desc: "15% discount on upgrading teller desks" }
        }
    },
    prestigeRegularBtn: "Regular Prestige",
    prestigeAdBtn: (shares) => `🎬 Triple to ${shares} Shares!`,
    prestigeCancelBtn: "Cancel",
    prestigeRewardLabel: "Golden Shares to receive:",
    analyticsTitle: "📊 Performance & Analytics Report",
    analyticsTotalEps: "Total Average Earnings Per Second (EPS):",
    analyticsVaultUtil: "Vault Volume Utilization:",
    analyticsTellersTitle: "Tellers EPS Breakdown",
    analyticsTellerEps: (id, eps) => `Teller ${id}: ${eps}/sec`,
    analyticsBottlenecksTitle: "Bottleneck Analysis",
    analyticsNoBottlenecks: "All systems running optimally in sync! 🟢",
    analyticsWarningVaultFull: "⚠️ Vault is full! Cash cannot be collected.",
    analyticsWarningQueueFull: "⚠️ Lobby queue is full! Clients might leave.",
    analyticsWarningGuardsSlow: "⚠️ Guards are too slow! Cash piling up at desks.",
    analyticsWarningTellersSlow: "⚠️ Tellers are too slow! Queue is not moving.",
    analyticsCloseBtn: "Close Report",
    eventEmergencyAlert: "📢 Emergency Bank Event!",
    eventChooseAction: "Select how to act:",
    events: {
        crowd: {
            title: "Sudden Customer Rush!",
            desc: "A huge crowd arrived and the lobby queue is packed. Rachel needs a quick decision.",
            optA: (cost) => `Hire Temp Marshall Staff (${cost})`,
            optADesc: "Increase queue capacity by 15 seats & double teller speed for 2 minutes!",
            optB: "Do nothing (Free)",
            optBDesc: "3 angry clients leave (reduces the rush)",
            optC: "🎬 Recruit Emergency Staff (Ad)",
            optCDesc: "Clear the queue instantly and earn 5.0x yield on those clients"
        },
        security: {
            title: "Vault Security Alert!",
            desc: "Sensors report suspicious activity near the main vault. Alan reports critical danger.",
            optA: (cost) => `Hire Private Security (${cost})`,
            optADesc: "Neutralize risk + immediate reputation bounty equal to 5 minutes of EPS!",
            optB: "Risk the threat (Free)",
            optBDesc: "50% risk to lose 10% vault cash, or 50% chance to defend and get 5% cash insurance payout!",
            optC: "🎬 Active Federal Lockdown (Ad)",
            optCDesc: (amt) => `Instant protection & receive a federal safety grant of ${amt}`
        },
        rescue: {
            title: "Government Bailout Grant!",
            desc: "Your bank has run into extreme financial issues and is stuck without cash. The state offers help.",
            optA: (amt) => `🎬 Accept Bailout Grant (${amt}) (Ad)`,
            optADesc: (amt) => `Receive ${amt} in cash instantly to continue operations`,
            optB: "Refuse Bailout (Free)",
            optBDesc: "Try to recover on your own"
        },
        rush_hours: {
            title: "Turbo Shift in Branch!",
            desc: "Your tellers are feeling exceptionally energized and motivated today. The service manager suggests boosting the speed!",
            optA: (cost) => `Pay employee bonus (${cost})`,
            optADesc: "Tellers work at 4x speed for 2 full minutes!",
            optB: "Continue normally (Free)",
            optBDesc: "Regular processing speed, no changes",
            optC: "🎬 Activate 10x Turbo Shift! (Ad)",
            optCDesc: "Tellers work at an insane 10x speed for 2 minutes!"
        },
        investor: {
            title: "External Investor Offer!",
            desc: "A wealthy investor wants to inject funds into your bank or sponsor executive training for your managers.",
            optA: (cash) => `🎬 Accept Capital Injection of ${cash} (Ad)`,
            optADesc: "Add immediate cash to your vault balance",
            optBUpgrade: (name, nextLvl) => `🎬 Fast Training: Upgrade ${name} to Lv ${nextLvl} (Ad)`,
            optBShares: "🎬 Golden Grant: Get 5 Golden Shares (Ad)",
            optBDesc: "Upgrade for free without spending cash",
            optC: "Decline Offer",
            optCDesc: "Keep running the bank as usual"
        }
    },
    bulkLabel: "Upgrade Mode:",
    synergiesTitle: "Manager Synergies",
    synergiesDesc: "Activate unique skill combinations between managers in adjacent departments to unlock powerful bonuses.",
    synergiesList: {
        operational: {
            name: "Operational Efficiency (Rachel + Alan)",
            desc: "Fast Service + Fast Sprint ➔ Tellers & Guards operate 10% faster."
        },
        logistics: {
            name: "Heavy Logistics (Rachel + Alan)",
            desc: "Wide Counter + Heavy Loader ➔ Teller & Guard capacities increased by 10%."
        },
        financial: {
            name: "Adjacent Financial (Rachel + Dan)",
            desc: "Fast Service + Portfolio Mgr ➔ Grants +10% boost to overall bank earnings."
        }
    }
});

Object.assign(translations.es, {
    boostBtn: "⚡ MULTIPLICAR x2",
    boostModalTitle: "🎬 Multiplicador de Ingresos (x2 BOOST)",
    boostModalText: "¡Mira un anuncio patrocinado para duplicar todos los ingresos por 4 horas! Puedes acumular tiempo hasta 8 horas.",
    boostActive: (time) => `⚡ Activo: ${time}`,
    boostExpired: "⚡ MULTIPLICAR x2",
    goldTotalEffect: "Tu efecto total",
    goldBranchProfits: "Ganancias de sucursales",
    goldCourierSpeed: "Velocidad de mensajeros",
    goldStartingCapital: "Capital inicial",
    goldGrandBonus: (pct) => `Bono total de mejoras de prestigio: <span class="gold-grand-bonus-val">+${pct}% a todas las ganancias ⬆</span>`,
    vaultSubtitle: "Ingresos pasivos de la bóveda principal",
    vaultYieldTitle: "Ganancia por Hora",
    vaultYieldSub: "de tu sucursal",
    vaultCapLabel: "Capacidad de Bóveda",
    vaultProgressLabel: (pct) => `Bóveda Llena: ${pct}%`,
    vaultInfoMsg: "La bóveda principal almacena todo el efectivo. Mejórala para aumentar la capacidad. ¡Si se llena, los mensajeros no podrán depositar y el progreso se detendrá!",
    goldShopTitle: "🏛️ Tienda de Prestigio (Mejoras de Oro)",
    goldShopDesc: "Compra activos permanentes con tus Acciones de Oro:",
    goldUpgrades: {
        startingCash: {
            title: "💵 Capital Inicial",
            desc: (lvl, nextVal) => `Comienza cada ronda con más efectivo. (Nivel ${lvl}/4 -> Comienza con $${nextVal})`
        },
        guardSpeed: {
            title: "👮 Escolta Federal",
            desc: (lvl) => `Aumento de velocidad permanente de +10% para guardias por nivel. (Nivel ${lvl}/5)`
        },
        premiumYield: {
            title: "📈 Servicio al Cliente Premium",
            desc: (lvl) => `Aumento de ingresos permanente de +10% para cajeros por nivel. (Nivel ${lvl}/5)`
        },
        shareEfficiency: {
            title: "🪙 Rendimiento de Acciones",
            desc: (lvl) => `Incrementa el rendimiento de cada Acción de Oro en +1% por nivel. (Nivel ${lvl}/4)`
        },
        offlineEarnings: {
            title: "💤 Turnos Largos",
            desc: (lvl) => `Aumenta el tiempo máximo de ganancias sin conexión en +2 horas por nivel. (Nivel ${lvl}/5)`
        },
        tellerCapacityBoost: {
            title: "👔 Software Avanzado",
            desc: (lvl) => `Capacidad permanente de +10% para cajeros por nivel. (Nivel ${lvl}/5)`
        },
        vaultCapacityBoost: {
            title: "🏦 Almacenamiento Comprimido",
            desc: (lvl) => `Capacidad permanente de +10% para la bóveda por nivel. (Nivel ${lvl}/5)`
        },
        eventBonus: {
            title: "🎩 Relaciones Públicas",
            desc: (lvl) => `Recompensas permanentes de +20% en todos los eventos aleatorios por nivel. (Nivel ${lvl}/5)`
        },
        managerDiscount: {
            title: "📉 Entrenamiento Corporativo",
            desc: (lvl) => `Reduce los costos de mejora de gerentes en -5% por nivel. (Nivel ${lvl}/4)`
        }
    },
    managerLevelLabel: (lvl) => `Nivel ${lvl}/5`,
    managerUpgradeCost: (cost) => `Mejorar Gerente: ${cost}`,
    managerSkillsTitle: "Rama de Especialización",
    managerSkillSelected: (skillName) => `Especial: ${skillName}`,
    managerSkillA: "Ruta A",
    managerSkillB: "Ruta B",
    managerSkillReset: "Restablecer Ruta",
    managerSkillResetCost: "Restablecer ($5,000)",
    managerSkillResetAd: "🎬 Gratis",
    managerSkills: {
        teller: {
            speed: { name: "Servicio Rápido", desc: "Reduce el tiempo de servicio de cajeros en 10%" },
            capacity: { name: "Caja Amplia", desc: "Aumenta la capacidad de efectivo de la caja en 15%" }
        },
        guard: {
            speed: { name: "Sprint Rápido", desc: "Reduce el tiempo de trayecto de guardias en 10%" },
            capacity: { name: "Cargador Pesado", desc: "Aumenta la capacidad de carga del guardia en 20%" }
        },
        vault: {
            investment: { name: "Gestor de Carteras", desc: "Rendimiento de inversión del +5% sobre ingresos bancarios" },
            tax: { name: "Optimizar Impuestos", desc: "Descuento del 15% en la mejora de las mesas de cajeros" }
        }
    },
    prestigeRegularBtn: "Prestigio Regular",
    prestigeAdBtn: (shares) => `🎬 ¡Triplica a ${shares} Acciones!`,
    prestigeCancelBtn: "Cancelar",
    prestigeRewardLabel: "Acciones de Oro a recibir:",
    analyticsTitle: "📊 Informe de Rendimiento y Métricas",
    analyticsTotalEps: "Ganancias Totales Promedio por Segundo (EPS):",
    analyticsVaultUtil: "Utilización de la Capacidad de la Bóveda:",
    analyticsTellersTitle: "Desglose de EPS de Cajeros",
    analyticsTellerEps: (id, eps) => `Cajero ${id}: ${eps}/seg`,
    analyticsBottlenecksTitle: "Análisis de Cuellos de Botella",
    analyticsNoBottlenecks: "¡Todos los sistemas funcionan de forma óptima! 🟢",
    analyticsWarningVaultFull: "⚠️ ¡Bóveda llena! No se puede guardar más dinero.",
    analyticsWarningQueueFull: "⚠️ ¡Fila del vestíbulo llena! Los clientes pueden irse.",
    analyticsWarningGuardsSlow: "⚠️ ¡Guardias lentos! Dinero acumulado en cajeros.",
    analyticsWarningTellersSlow: "⚠️ ¡Cajeros lentos! La fila no se está moviendo.",
    analyticsCloseBtn: "Cerrar Informe",
    eventEmergencyAlert: "📢 ¡Evento de Emergencia Bancaria!",
    eventChooseAction: "Elige cómo actuar:",
    events: {
        crowd: {
            title: "¡Afluencia Repentina de Clientes!",
            desc: "Una gran multitud llegó al vestíbulo y la fila está llena. Rachel necesita una decisión.",
            optA: (cost) => `Contratar ordenador de fila (${cost})`,
            optADesc: "Aumenta la fila en 15 puestos y duplica velocidad de cajeros por 2 minutos",
            optB: "No hacer nada (Gratis)",
            optBDesc: "3 clientes enojados se van (reduce la afluencia)",
            optC: "🎬 Personal de Emergencia (Anuncio)",
            optCDesc: "Limpia la fila al instante y gana 5.0x con esos clientes"
        },
        security: {
            title: "¡Alerta de Seguridad en Bóveda!",
            desc: "Los sensores reportan actividad sospechosa cerca de la bóveda principal. Alan reporta peligro.",
            optA: (cost) => `Seguridad Privada (${cost})`,
            optADesc: "Neutraliza riesgo + recompensa de reputación igual a 5 minutos de EPS",
            optB: "Ignorar amenaza (Gratis)",
            optBDesc: "50% riesgo de perder 10% de bóveda, o 50% de defensa exitosa y ganar 5% de efectivo total",
            optC: "🎬 Cierre Federal Activo (Anuncio)",
            optCDesc: (amt) => `Protección instantánea y recibe un subsidio de seguridad de ${amt}`
        },
        rescue: {
            title: "¡Rescate Financiero Estatal!",
            desc: "Tu banco enfrenta graves dificultades financieras y está atascado sin efectivo. El gobierno ofrece ayuda.",
            optA: (amt) => `🎬 Aceptar Rescate Estatal (${amt}) (Anuncio)`,
            optADesc: (amt) => `Recibe ${amt} en efectivo al instante para continuar operando`,
            optB: "Rechazar Rescate (Gratis)",
            optBDesc: "Intenta recuperarte por tu cuenta"
        },
        rush_hours: {
            title: "¡Turno Turbo en la Sucursal!",
            desc: "Tus cajeros se sienten excepcionalmente motivados y enérgicos hoy. ¡El gerente sugiere aumentar el ritmo!",
            optA: (cost) => `Pagar bono a empleados (${cost})`,
            optADesc: "Los cajeros trabajarán a velocidad 4x por 2 minutos enteros",
            optB: "Continuar normalmente (Gratis)",
            optBDesc: "Velocidad de procesamiento normal, sin cambios",
            optC: "🎬 ¡Activar Turno Turbo 10x! (Anuncio)",
            optCDesc: "¡Los cajeros trabajarán a velocidad increíble de 10x por 2 minutos!"
        },
        investor: {
            title: "¡Oferta de Inversor Externo!",
            desc: "Un inversor millonario quiere inyectar fondos en tu banco o financiar capacitación para tus gerentes.",
            optA: (cash) => `🎬 Aceptar Inyección de ${cash} (Anuncio)`,
            optADesc: "Añade efectivo inmediato a tu saldo de caja",
            optBUpgrade: (name, nextLvl) => `🎬 Capacitación Rápida: Mejora a ${name} al Nivel ${nextLvl} (Anuncio)`,
            optBShares: "🎬 Subvención de Oro: Obtén 5 Acciones de Oro (Anuncio)",
            optBDesc: "Mejora gratis sin gastar efectivo",
            optC: "Rechazar Oferta",
            optCDesc: "Sigue administrando el banco normalmente"
        }
    },
    bulkLabel: "Modo de mejora:",
    synergiesTitle: "Sinergias de Gerentes",
    synergiesDesc: "Activa combinaciones de habilidades únicas entre gerentes en departamentos contiguos para desbloquear poderosos bonos.",
    synergiesList: {
        operational: {
            name: "Eficiencia Operativa (Raquel + Alán)",
            desc: "Servicio Rápido + Sprint Rápido ➔ Cajeros y guardias operan un 10% más rápido."
        },
        logistics: {
            name: "Logística Pesada (Raquel + Alán)",
            desc: "Caja Amplia + Cargador Pesado ➔ Capacidades de cajeros y guardias aumentadas en un 10%."
        },
        financial: {
            name: "Financiera Adyacente (Raquel + Daniel)",
            desc: "Servicio Rápido + Gestor de Carteras ➔ Otorga un +10% de impulso a los ingresos generales."
        }
    }
});

Object.assign(translations.ru, {
    boostBtn: "⚡ УСКОРЕНИЕ x2",
    boostModalTitle: "🎬 Удвоение Доходов (2x BOOST)",
    boostModalText: "Посмотрите короткую рекламу спонсора, чтобы удвоить весь доход на 4 часа! Время суммируется до 8 часов.",
    boostActive: (time) => `⚡ Активно: ${time}`,
    boostExpired: "⚡ УСКОРЕНИЕ x2",
    goldTotalEffect: "Ваш общий эффект",
    goldBranchProfits: "Прибыль филиалов",
    goldCourierSpeed: "Скорость курьеров",
    goldStartingCapital: "Стартовый капитал",
    goldGrandBonus: (pct) => `Общий бонус от престиж-улучшений: <span class="gold-grand-bonus-val">+${pct}% к прибыли всех филиалов ⬆</span>`,
    vaultSubtitle: "Пассивный доход из главного сейфа",
    vaultYieldTitle: "Прибыль в час",
    vaultYieldSub: "вашего филиала",
    vaultCapLabel: "Вместимость сейфа",
    vaultProgressLabel: (pct) => `Заполненность сейфа: ${pct}%`,
    vaultInfoMsg: "Главный сейф хранит все деньги. Улучшайте его для увеличения емкости. Если он заполнится, курьеры не смогут вносить наличные и прогресс остановится!",
    goldShopTitle: "🏛️ Престиж Магазин (Золотые улучшения)",
    goldShopDesc: "Покупайте постоянные улучшения за Золотые Акции:",
    goldUpgrades: {
        startingCash: {
            title: "💵 Начальный капитал",
            desc: (lvl, nextVal) => `Начинайте каждый раунд с большей суммой наличных. (Уровень ${lvl}/4 -> Старт с $${nextVal})`
        },
        guardSpeed: {
            title: "👮 Федеральное сопровождение",
            desc: (lvl) => `Постоянное ускорение инкассаторов на +10% за уровень. (Уровень ${lvl}/5)`
        },
        premiumYield: {
            title: "📈 Премиум обслуживание",
            desc: (lvl) => `Постоянное увеличение дохода кассиров на +10% за уровень. (Уровень ${lvl}/5)`
        },
        shareEfficiency: {
            title: "🪙 Эффективность акций",
            desc: (lvl) => `Увеличивает доходность от каждой Золотой Акции на +1% за уровень. (Уровень ${lvl}/4)`
        },
        offlineEarnings: {
            title: "💤 Длинные смены",
            desc: (lvl) => `Увеличивает максимальное время оффлайн-заработка на +2 часа за уровень. (Уровень ${lvl}/5)`
        },
        tellerCapacityBoost: {
            title: "👔 Продвинутое ПО",
            desc: (lvl) => `Постоянные +10% к вместимости кассиров за уровень. (Уровень ${lvl}/5)`
        },
        vaultCapacityBoost: {
            title: "🏦 Сжатое хранилище",
            desc: (lvl) => `Постоянные +10% к вместимости хранилища за уровень. (Уровень ${lvl}/5)`
        },
        eventBonus: {
            title: "🎩 Харизматичный PR",
            desc: (lvl) => `Постоянные +20% к наградам за случайные события за уровень. (Уровень ${lvl}/5)`
        },
        managerDiscount: {
            title: "📉 Корпоративное обучение",
            desc: (lvl) => `Снижает стоимость улучшения менеджеров на -5% за уровень. (Уровень ${lvl}/4)`
        }
    },
    managerLevelLabel: (lvl) => `Уровень ${lvl}/5`,
    managerUpgradeCost: (cost) => `Улучшить менеджеру: ${cost}`,
    managerSkillsTitle: "Специализация менеджера",
    managerSkillSelected: (skillName) => `Спец: ${skillName}`,
    managerSkillA: "Путь А",
    managerSkillB: "Путь Б",
    managerSkillReset: "Сбросить специализацию",
    managerSkillResetCost: "Сброс ($5,000)",
    managerSkillResetAd: "🎬 Бесплатно",
    managerSkills: {
        teller: {
            speed: { name: "Быстрое обслуж.", desc: "Сокращает время работы кассиров на 10%" },
            capacity: { name: "Широкая стойка", desc: "Увеличивает вместимость денег кассы на 15%" }
        },
        guard: {
            speed: { name: "Быстрый бег", desc: "Сокращает время обхода инкассаторов на 10%" },
            capacity: { name: "Тяжелый груз", desc: "Увеличивает грузоподъемность инкассатора на 20%" }
        },
        vault: {
            investment: { name: "Управление портф.", desc: "Инвестиционная доходность +5% на все доходы банка" },
            tax: { name: "Оптимизация налогов", desc: "Скидка 15% на улучшение касс" }
        }
    },
    prestigeRegularBtn: "Обычный престиж",
    prestigeAdBtn: (shares) => `🎬 Утроить до ${shares} акций!`,
    prestigeCancelBtn: "Отмена",
    prestigeRewardLabel: "Золотые Акции к получению:",
    analyticsTitle: "📊 Отчет о производительности и аналитике",
    analyticsTotalEps: "Общая средняя прибыль в секунду (EPS):",
    analyticsVaultUtil: "Заполненность главного сейфа:",
    analyticsTellersTitle: "Прибыль кассиров в секунду",
    analyticsTellerEps: (id, eps) => `Кассир ${id}: ${eps}/сек`,
    analyticsBottlenecksTitle: "Анализ узких мест",
    analyticsNoBottlenecks: "Все системы работают отлично и синхронно! 🟢",
    analyticsWarningVaultFull: "⚠️ Сейф заполнен! Деньги больше не собираются.",
    analyticsWarningQueueFull: "⚠️ Очередь переполнена! Клиенты могут уйти.",
    analyticsWarningGuardsSlow: "⚠️ Медленные инкассаторы! Деньги копятся у касс.",
    analyticsWarningTellersSlow: "⚠️ Медленные кассиры! Очередь не движется.",
    analyticsCloseBtn: "Закрыть Отчет",
    eventEmergencyAlert: "📢 Чрезвычайное событие в банке!",
    eventChooseAction: "Выберите действие:",
    events: {
        crowd: {
            title: "Внезапный наплыв клиентов!",
            desc: "Огромная толпа пришла в банк, очередь переполнена. Рахель просит срочно принять решение.",
            optA: (cost) => `Нанять координатора очереди (${cost})`,
            optADesc: "Увеличить очередь на 15 мест и удвоить скорость кассиров на 2 минуты!",
            optB: "Ничего не делать (Бесплатно)",
            optBDesc: "3 разгневанных клиента уходят (уменьшая нагрузку)",
            optC: "🎬 Вызвать дежурных (Реклама)",
            optCDesc: "Мгновенно очистить очередь и получить 5.0x доход за них"
        },
        security: {
            title: "Тревога сейфа!",
            desc: "Датчики сообщают о подозрительной активности у главного сейфа. Алон сообщает об угрозе.",
            optA: (cost) => `Нанять ЧОП (${cost})`,
            optADesc: "Нейтрализовать риск + бонус репутации в размере 5 минут EPS!",
            optB: "Игнорировать угрозу (Бесплатно)",
            optBDesc: "50% шанс потерять 10% сейфа, или 50% шанс отбиться и получить страховку 5% наличных!",
            optC: "🎬 Ввести полный карантин (Реклама)",
            optCDesc: (amt) => `Мгновенная защита и получение федерального гранта в размере ${amt}`
        },
        rescue: {
            title: "Государственная финансовая помощь!",
            desc: "Ваш банк столкнулся с серьезным дефицитом бюджета. Государство предлагает поддержку.",
            optA: (amt) => `🎬 Принять финпомощь (${amt}) (Реклама)`,
            optADesc: (amt) => `Получить ${amt} наличными мгновенно для продолжения работы`,
            optB: "Отказаться от помощи (Бесплатно)",
            optBDesc: "Попробовать восстановиться своими силами"
        },
        rush_hours: {
            title: "Турбо-смена в банке!",
            desc: "Ваши кассиры сегодня чувствуют себя на редкость бодрыми и мотивированными. Менеджер предлагает увеличить темп!",
            optA: (cost) => `Выплатить бонус сотрудникам (${cost})`,
            optADesc: "Кассиры будут работать с ускорением 4x на целых 2 минуты!",
            optB: "Продолжать как обычно (Бесплатно)",
            optBDesc: "Обычная скорость работы, без изменений",
            optC: "🎬 Активировать Турбо-смену 10x! (Реклама)",
            optCDesc: "Кассиры будут работать на безумной скорости 10x в течение 2 минут!"
        },
        investor: {
            title: "Предложение инвестора!",
            desc: "Богатый инвестор готов вложить капитал в ваш банк или спонсировать обучение ваших менеджеров.",
            optA: (cash) => `🎬 Получить инвестицию ${cash} (Реклама)`,
            optADesc: "Мгновенное пополнение кассы банка",
            optBUpgrade: (name, nextLvl) => `🎬 Быстрое обучение: Улучшить ${name} до ур. ${nextLvl} (Реклама)`,
            optBShares: "🎬 Золотой грант: Получить 5 золотых акций (Реклама)",
            optBDesc: "Бесплатное улучшение без траты денег",
            optC: "Отклонить",
            optCDesc: "Продолжить работу в обычном режиме"
        }
    },
    bulkLabel: "Режим улучшения:",
    synergiesTitle: "Синергии менеджеров",
    synergiesDesc: "Активируйте уникальные комбинации навыков менеджеров смежных отделов, чтобы разблокировать мощные бонусы.",
    synergiesList: {
        operational: {
            name: "Операционная ответственность (Рахиль + Алан)",
            desc: "Быстрое обслуж. + Быстрый бег ➔ Кассиры и инкассаторы работают на 10% быстрее."
        },
        logistics: {
            name: "Тяжелая логистика (Рахиль + Алан)",
            desc: "Широкая стойка + Тяжелый груз ➔ Вместимость касс и инкассаторов увеличена на 10%."
        },
        financial: {
            name: "Смежная финансовая (Рахиль + Даниил)",
            desc: "Быстрое обслуж. + Управление портф. ➔ Увеличивает общий доход банка на 10%."
        }
    }
});
