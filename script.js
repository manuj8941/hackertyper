// script.js – main hacker console logic
// NOTE: sounds.js must be loaded BEFORE this file in index.html

// ========== GLOBAL STATE ==========

let fakeCode = "";
let logLines = [];

// cursor blink
let showCursor = true;

// HUD
let sessionStart = Date.now();

// CONFIG
const charsPerKey = 5;
const logsPerKey = 0.3;

// STATE
let codeIndex = 0;
let logIndex = 0;
let logCounter = 0;
let isMobileBlocked = false;

// DOM
const codeDisplay = document.getElementById( "code-display" );
const logDisplay = document.getElementById( "log-display" );
const overlay = document.getElementById( "overlay" );
const overlayText = document.getElementById( "overlay-text" );
const deviceOverlay = document.getElementById( "device-overlay" );

const hudCpu = document.getElementById( "hud-cpu" );
const hudTrace = document.getElementById( "hud-trace" );
const hudIce = document.getElementById( "hud-ice" );
const hudSession = document.getElementById( "hud-session" );
const hudIp = document.getElementById( "hud-ip" );

// New HUD elements
const hudTemp = document.getElementById( "hud-temp" );
const hudFan = document.getElementById( "hud-fan" );
const hudVolt = document.getElementById( "hud-volt" );
const hudGpu = document.getElementById( "hud-gpu" );
const hudVrm = document.getElementById( "hud-vrm" );

const hudEntropy = document.getElementById( "hud-entropy" );
const hudSigil = document.getElementById( "hud-sigil" );
const hudToken = document.getElementById( "hud-token" );
const hudHash = document.getElementById( "hud-hash" );
const hudPrng = document.getElementById( "hud-prng" );
const hudKeyrot = document.getElementById( "hud-keyrot" );


// ========== MOBILE / SMALL SCREEN DETECTION ==========

function detectMobileOrSmall ()
{
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    const isTouch = /Mobi|Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test( ua );
    const smallScreen = window.innerWidth < 900;

    if ( isTouch || smallScreen )
    {
        isMobileBlocked = true;
        deviceOverlay.classList.remove( "hidden" );
    }
}

detectMobileOrSmall();
window.addEventListener( "resize", () =>
{
    if ( isMobileBlocked ) return;
    detectMobileOrSmall();
} );


// ========== LOAD EXTERNAL TEXT FILES ==========

// fake_code.txt
fetch( "fake_code.txt" )
    .then( res => res.text() )
    .then( text =>
    {
        fakeCode = text;
    } );

// terminal_logs.txt
fetch( "terminal_logs.txt" )
    .then( res => res.text() )
    .then( text =>
    {
        logLines = text
            .split( "\n" )
            .map( l => l.trim() )
            .filter( l => l !== "" );
    } );


// ========== UTILS ==========

function escapeHtml ( str )
{
    return str
        .replace( /&/g, "&amp;" )
        .replace( /</g, "&lt;" )
        .replace( />/g, "&gt;" );
}

function randomInt ( min, max )
{
    return Math.floor( Math.random() * ( max - min + 1 ) ) + min;
}

function randomIp ()
{
    return `${ randomInt( 10, 250 ) }.${ randomInt( 0, 255 ) }.${ randomInt( 0, 255 ) }.${ randomInt( 1, 254 ) }`;
}

function randomPort ()
{
    return randomInt( 1024, 65535 );
}

// Replace placeholders {IP} and {PORT}
function processLogTemplate ( line )
{
    return line
        .replace( /\{IP\}/g, randomIp() )
        .replace( /\{PORT\}/g, randomPort() );
}


// ========== CODE REVEAL + CURSOR ==========

function renderCode ()
{
    if ( !fakeCode ) return;

    const visible = fakeCode.slice( 0, codeIndex );
    const cursorChar = showCursor ? "▌" : " ";
    codeDisplay.innerHTML = escapeHtml( visible ) + cursorChar;

    codeDisplay.scrollTop = codeDisplay.scrollHeight;
}
function revealMoreCode ()
{
    if ( !fakeCode ) return;

    codeIndex += charsPerKey;

    // when we reach the end, reset and start "typing" from top again
    if ( codeIndex > fakeCode.length )
    {
        codeIndex = 0;  // clear screen once
    }

    renderCode();
}

// blink cursor
setInterval( () =>
{
    showCursor = !showCursor;
    renderCode();
}, 500 );


// ========== LOG TERMINAL ==========

function addLogLine ()
{
    if ( logLines.length === 0 ) return;

    let raw = logLines[ logIndex ];
    logIndex = ( logIndex + 1 ) % logLines.length;

    const lineText = processLogTemplate( raw );

    const div = document.createElement( "div" );
    div.className = "line";

    if ( lineText.includes( "[ALERT]" ) )
    {
        div.classList.add( "alert" );
    }

    div.textContent = lineText;
    logDisplay.appendChild( div );

    const maxLines = 120;
    while ( logDisplay.children.length > maxLines )
    {
        logDisplay.removeChild( logDisplay.firstChild );
    }

    logDisplay.scrollTop = logDisplay.scrollHeight;
}


// ========== HUD UPDATE (ALL SECTIONS) ==========

function randomHex ( size = 6 )
{
    let out = "0x";
    const hex = "0123456789ABCDEF";
    for ( let i = 0; i < size; i++ )
    {
        out += hex[ Math.floor( Math.random() * hex.length ) ];
    }
    return out;
}

function updateHud ()
{
    if ( isMobileBlocked ) return;

    // STATUS HUD
    const cpu = 20 + Math.round( Math.random() * 73 );
    hudCpu.textContent = cpu + "%";

    const states = [ "IDLE", "SCANNING", "BACKDOOR", "TRACED", "GHOSTED" ];
    hudTrace.textContent = states[ randomInt( 0, states.length - 1 ) ];
    hudIce.textContent = cpu > 70 ? "BREACHED" : "BYPASSED";

    const diff = Math.floor( ( Date.now() - sessionStart ) / 1000 );
    const h = String( Math.floor( diff / 3600 ) ).padStart( 2, "0" );
    const m = String( Math.floor( ( diff % 3600 ) / 60 ) ).padStart( 2, "0" );
    const s = String( diff % 60 ).padStart( 2, "0" );
    hudSession.textContent = `${ h }:${ m }:${ s }`;

    if ( Math.random() < 0.2 )
    {
        hudIp.textContent = randomIp();
    }

    // SYSTEM METRICS
    if ( hudTemp )
    {
        const baseTemp = 40 + Math.round( cpu / 4 );
        hudTemp.textContent = baseTemp + "°C";
    }
    if ( hudFan )
    {
        hudFan.textContent = String( 5900 + randomInt( 0, 1200 ) );
    }
    if ( hudVolt )
    {
        const v = 1.05 + Math.random() * 0.25;
        hudVolt.textContent = v.toFixed( 2 ) + "V";
    }
    if ( hudGpu )
    {
        hudGpu.textContent = ( 35 + randomInt( 0, 20 ) ) + "°C";
    }
    if ( hudVrm )
    {
        hudVrm.textContent = ( 45 + randomInt( 0, 10 ) ) + "°C";
    }

    // CRYPTO STATE
    if ( hudEntropy )
    {
        hudEntropy.textContent = randomHex( 6 );
    }
    if ( hudSigil )
    {
        // keep sigil mostly constant with slight variations
        hudSigil.textContent = "0xDEAD" + randomHex( 2 ).slice( 2 );
    }
    if ( hudToken )
    {
        hudToken.textContent = "0xC0FFEE";
    }
    if ( hudHash )
    {
        hudHash.textContent = "0xB16B00B5";
    }
    if ( hudPrng )
    {
        const prngStates = [ "CHAOTIC", "ENTANGLED", "DEGRADED", "STABLE?" ];
        hudPrng.textContent = prngStates[ randomInt( 0, prngStates.length - 1 ) ];
    }
    if ( hudKeyrot )
    {
        hudKeyrot.textContent = Math.random() < 0.3 ? "IDLE" : "ACTIVE";
    }
}

setInterval( updateHud, 1000 );


// ========== ACCESS OVERLAY ==========

function showOverlay ( type )
{
    if ( isMobileBlocked ) return;

    overlay.classList.remove( "hidden", "granted", "denied" );
    overlay.classList.add( type );

    if ( type === "granted" )
    {
        overlayText.textContent = "ACCESS GRANTED";
        if ( typeof playGrantedTone === "function" ) playGrantedTone();
    } else
    {
        overlayText.textContent = "ACCESS DENIED";
        if ( typeof playAlertBeep === "function" ) playAlertBeep();
    }
}

function hideOverlay ()
{
    overlay.classList.add( "hidden" );
}


// ========== MAIN TRIGGER ==========

function triggerActivity ( playSound = true )
{
    if ( isMobileBlocked ) return;

    revealMoreCode();

    logCounter += logsPerKey;
    if ( logCounter >= 1 )
    {
        addLogLine();
        logCounter -= 1;
    }

    if ( playSound && typeof playKeyClick === "function" )
    {
        playKeyClick();
    }

    // sparks
    function spawnSpark ()
    {
        const spark = document.createElement( "div" );
        spark.className = "spark";
        spark.style.left = ( 10 + Math.random() * 40 ) + "vw";
        spark.style.top = ( 20 + Math.random() * 40 ) + "vh";

        document.body.appendChild( spark );
        setTimeout( () => spark.remove(), 300 );
    }
    spawnSpark();
}


// ========== EVENT HANDLERS ==========

document.addEventListener( "keydown", ( e ) =>
{
    if ( isMobileBlocked ) return;

    // overlay control
    if ( e.key === "Escape" )
    {
        hideOverlay();
        return;
    }

    // ACCESS combos
    if ( e.altKey && e.key === "3" )
    {
        showOverlay( "granted" );
        return;
    }
    if ( e.altKey && e.key === "4" )
    {
        showOverlay( "denied" );
        return;
    }

    // ignore pure modifier keys
    if ( [ "Shift", "Alt", "Control", "Meta" ].includes( e.key ) ) return;

    triggerActivity( true );
} );

// mouse/touch
document.addEventListener( "click", () =>
{
    if ( isMobileBlocked ) return;
    triggerActivity( false );
} );


// ========== EXTRA EFFECTS: FLICKER + PULSE ==========

function flickerRandomLine ()
{
    const lines = document.querySelectorAll( '#log-display .line' );
    if ( lines.length === 0 ) return;
    const random = lines[ Math.floor( Math.random() * lines.length ) ];
    random.classList.add( "flicker" );
    setTimeout( () => random.classList.remove( "flicker" ), 300 );
}

setInterval( flickerRandomLine, 1000 );

setInterval( () =>
{
    const app = document.getElementById( "app" );
    if ( !app || isMobileBlocked ) return;
    app.classList.add( "pulse" );
    setTimeout( () =>
        app.classList.remove( "pulse" ),
        1000 );
}, 7000 );
