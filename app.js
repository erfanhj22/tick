let peer, conn, mySymbol, currentPlayer="X", board=["","","","","","","","",""], gameActive=true
let scores={X:0,O:0,D:0}, timeLeft=10, timerInterval=null
const cells=document.querySelectorAll(\'.cell\'), statusText=document.getElementById(\'status\')
const timerBar=document.getElementById(\'timerBar\'), timerText=document.getElementById(\'timerText\')
const audioCtx = new (window.AudioContext || window.webkitAudioContext)()

function playSound(freq, duration, type=\'sine\', vol=0.3){
 if(!document.getElementById(\'soundToggle\').checked) return
 const o=audioCtx.createOscillator(), g=audioCtx.createGain()
 o.type=type; o.frequency.value=freq; g.gain.value=vol
 o.connect(g); g.connect(audioCtx.destination)
 o.start(); g.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime+duration)
 o.stop(audioCtx.currentTime+duration)
}
const soundClick=()=>playSound(800,0.1), soundWin=()=>[523,659,784].forEach((f,i)=>setTimeout(()=>playSound(f,0.3),i*120)), soundLose=()=>playSound(150,0.6,\'sawtooth\'), soundDraw=()=>playSound(400,0.4,\'square\')

function createGame(){
  mySymbol="X"
  const id="XO-"+Math.random().toString(36).substring(2,6).toUpperCase()
  peer=new Peer(id)
  peer.on(\'open\',id=>{document.getElementById(\'myId\').textContent=id;document.getElementById(\'myIdBox\').style.display="block"})
  peer.on(\'connection\',c=>{conn=c;setup()})
}
function joinGame(){
  const room=document.getElementById(\'roomInput\').value.trim()
  if(!room) return alert("کد اتاق رو وارد کن")
  mySymbol="O"; peer=new Peer()
  peer.on(\'open\',()=>{conn=peer.connect(room);setup()})
  document.getElementById(\'lobbyStatus\').textContent="در حال اتصال..."
}
function setup(){
  conn.on(\'open\',()=>{
    document.getElementById(\'lobby\').style.display="none"
    document.getElementById(\'game\').style.display="block"
    document.getElementById(\'youAre\').textContent=`تو بازیکن ${mySymbol} هستی`
    updateStatus(); startTimer()
  })
  conn.on(\'data\',d=>{
    if(d.type==="move"){board[d.index]=d.symbol;render();soundClick();checkWinner();if(gameActive){currentPlayer=currentPlayer==="X"?"O":"X";updateStatus();resetTimer()}}
    if(d.type==="restart"){resetBoard()}
    if(d.type==="timeout"){currentPlayer=currentPlayer==="X"?"O":"X";updateStatus();resetTimer()}
    if(d.type==="chat"){addMsg(d.text,"enemy")}
    if(d.type==="score"){scores=d.scores; updateScores()}
  })
}
cells.forEach(c=>c.addEventListener(\'click\',()=>{
  const i=c.dataset.index
  if(!gameActive||board[i]!==""||currentPlayer!==mySymbol) return
  board[i]=mySymbol; render(); soundClick()
  conn.send({type:"move",index:i,symbol:mySymbol})
  checkWinner()
  if(gameActive){currentPlayer=currentPlayer==="X"?"O":"X";updateStatus();resetTimer()}
}))
function render(){
  cells.forEach((c,i)=>{
    c.textContent=board[i]; c.className="cell"
    if(board[i]==="X")c.classList.add("x"); if(board[i]==="O")c.classList.add("o")
    if(currentPlayer!==mySymbol) c.classList.add("disabled")
  })
}
function updateStatus(){
  if(!gameActive) return; render()
  if(currentPlayer===mySymbol){statusText.textContent="✨ نوبت توئه!";statusText.style.background="#2ecc71"}
  else{statusText.textContent="⏳ نوبت حریفه...";statusText.style.background="rgba(0,0,0,0.3)"}
}
function checkWinner(){
  const wins=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]
  for(let [a,b,c] of wins){
    if(board[a]&&board[a]===board[b]&&board[a]===board[c]){
      gameActive=false; stopTimer()
      ;[a,b,c].forEach(i=>cells[i].classList.add(\'win\'))
      if(board[a]===mySymbol){statusText.textContent="🎉 برنده شدی!";scores[mySymbol]++; soundWin(); launchConfetti()}
      else{statusText.textContent="😢 باختی!";scores[mySymbol==="X"?"O":"X"]++; soundLose()}
      updateScores(); syncScore(); return
    }
  }
  if(!board.includes("")){gameActive=false;stopTimer();statusText.textContent="🤝 مساوی!";statusText.style.background="#f39c12";scores.D++;soundDraw();updateScores();syncScore()}
}
function updateScores(){
  document.getElementById(\'scoreX\').textContent=scores.X
  document.getElementById(\'scoreO\').textContent=scores.O
  document.getElementById(\'scoreD\').textContent=scores.D
}
function syncScore(){ if(conn&&conn.open) conn.send({type:"score", scores})}
function resetBoard(){
  board=["","","","","","","","",""];gameActive=true;currentPlayer="X"
  document.querySelectorAll(\'.cell\').forEach(c=>{c.textContent="";c.className="cell"})
  updateStatus();resetTimer()
}
function requestRestart(){resetBoard();if(conn&&conn.open)conn.send({type:"restart"})}
function startTimer(){
  stopTimer(); timeLeft=10; updateTimerUI()
  timerInterval=setInterval(()=>{
    timeLeft--; updateTimerUI()
    if(timeLeft<=3 && timeLeft>0) playSound(1000,0.1)
    if(timeLeft<=0){
      stopTimer()
      if(currentPlayer===mySymbol){
        conn.send({type:"timeout"})
        currentPlayer=currentPlayer==="X"?"O":"X";updateStatus();resetTimer()
      }
    }
  },1000)
}
function resetTimer(){stopTimer();if(gameActive)startTimer()}
function stopTimer(){clearInterval(timerInterval)}
function updateTimerUI(){
  timerBar.style.width=(timeLeft*10)+"%"; timerText.textContent=`⏱ ${timeLeft} ثانیه`
  timerBar.style.background=timeLeft<=3?"#ff416c":"linear-gradient(90deg,#00f260,#0575e6)"
}
function sendChat(){
  const inp=document.getElementById(\'chatInput\')
  if(!inp.value.trim()||!conn) return
  addMsg(inp.value,"me"); conn.send({type:"chat",text:inp.value}); inp.value=""
}
function addMsg(text,who){
  const box=document.getElementById(\'messages\'), d=document.createElement(\'div\')
  d.className="msg "+who; d.textContent=text; box.appendChild(d); box.scrollTop=box.scrollHeight
}
function copyId(){navigator.clipboard.writeText(document.getElementById(\'myId\').textContent);alert("کپی شد ✅")}
function launchConfetti(){
  const canvas=document.getElementById(\'confetti\'), ctx=canvas.getContext(\'2d\')
  canvas.width=window.innerWidth; canvas.height=window.innerHeight
  let pieces=[...Array(100)].map(()=>({x:Math.random()*canvas.width,y:Math.random()*canvas.height-500,r:Math.random()*6+4,d:Math.random()*20+10,color:`hsl(${Math.random()*360},100%,50%)`,vx:Math.random()*4-2,vy:Math.random()*3+2}))
  let frame=0
  function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height)
    pieces.forEach(p=>{ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();p.x+=p.vx;p.y+=p.vy;p.vy+=0.1})
    if(frame++<150) requestAnimationFrame(draw); else ctx.clearRect(0,0,canvas.width,canvas.height)
  } draw()
}s