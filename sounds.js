// sounds.js – 80s hacker style Web Audio sounds using ONE shared AudioContext

let audioCtx = null;
let lastKeySoundTime = 0;

// ensure context exists & is resumed (browsers often start it suspended)
function getAudioCtx ()
{
    if ( !audioCtx )
    {
        audioCtx = new ( window.AudioContext || window.webkitAudioContext )();
    }
    if ( audioCtx.state === "suspended" )
    {
        audioCtx.resume();
    }
    return audioCtx;
}

// simple helper to create osc + gain
function makeOsc ( type, freqStart, freqEnd, durationSec, startGain )
{
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    osc.type = type;
    osc.frequency.setValueAtTime( freqStart, now );
    if ( freqEnd && freqEnd !== freqStart )
    {
        osc.frequency.exponentialRampToValueAtTime( freqEnd, now + durationSec );
    }

    gain.gain.setValueAtTime( startGain, now );
    gain.gain.exponentialRampToValueAtTime( 0.0001, now + durationSec );

    osc.connect( gain );
    gain.connect( ctx.destination );

    osc.start( now );
    osc.stop( now + durationSec );
}

// 1) KEY CLICK – short mechanical tick
function playKeyClick ()
{
    const ctx = getAudioCtx();
    const now = ctx.currentTime;

    // throttle: avoid playing >1 click every 15ms
    if ( now - lastKeySoundTime < 0.015 ) return;
    lastKeySoundTime = now;

    makeOsc( "square", 260, 240, 0.03, 0.25 );
}

// 2) ALERT / ERROR – aggressive 80s alarm
function playAlertBeep ()
{
    makeOsc( "sawtooth", 120, 880, 0.18, 0.4 );
}

// 3) ACCESS GRANTED – synthy rising chirp
function playGrantedTone ()
{
    makeOsc( "triangle", 200, 520, 0.3, 0.3 );
}
