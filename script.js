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

// DOM
const codeDisplay = document.getElementById( "code-display" );
const logDisplay = document.getElementById( "log-display" );
const overlay = document.getElementById( "overlay" );
const overlayText = document.getElementById( "overlay-text" );

const hudCpu = document.getElementById( "hud-cpu" );
const hudTrace = document.getElementById( "hud-trace" );
const hudIce = document.getElementById( "hud-ice" );
const hudSession = document.getElementById( "hud-session" );
const hudIp = document.getElementById( "hud-ip" );


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
    if ( codeIndex > fakeCode.length ) codeIndex = fakeCode.length;

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


// ========== HUD UPDATE ==========

function updateHud ()
{
    // fake CPU 20–93%
    const cpu = 20 + Math.round( Math.random() * 73 );
    hudCpu.textContent = cpu + "%";

    // NET TRACE status
    const states = [ "IDLE", "SCANNING", "BACKDOOR", "TRACED", "GHOSTED" ];
    hudTrace.textContent = states[ randomInt( 0, states.length - 1 ) ];

    // BLACKICE status
    hudIce.textContent = cpu > 70 ? "BREACHED" : "BYPASSED";

    // session time
    const diff = Math.floor( ( Date.now() - sessionStart ) / 1000 );
    const h = String( Math.floor( diff / 3600 ) ).padStart( 2, "0" );
    const m = String( Math.floor( ( diff % 3600 ) / 60 ) ).padStart( 2, "0" );
    const s = String( diff % 60 ).padStart( 2, "0" );
    hudSession.textContent = `${ h }:${ m }:${ s }`;

    // ghost IP (change sometimes)
    if ( Math.random() < 0.2 )
    {
        hudIp.textContent = randomIp();
    }
}

setInterval( updateHud, 1000 );


// ========== ACCESS OVERLAY ==========

function showOverlay ( type )
{
    // type: "granted" | "denied"
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
}


// ========== EVENT HANDLERS ==========

document.addEventListener( "keydown", ( e ) =>
{
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
    triggerActivity( false );
} );
