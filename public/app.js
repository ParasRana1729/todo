const API = '';
let mode = 'signin';

const $ = s => document.getElementById(s);
const authSection = $('authSection'), appSection = $('appSection'), userBadge = $('userBadge'), logoutBtn = $('logoutBtn');

function switchTab(m){
  mode = m;
  $('tabSignin').classList.toggle('active', m==='signin');
  $('tabSignup').classList.toggle('active', m==='signup');
  $('authBtnText').textContent = m==='signin' ? 'Sign in' : 'Create account';
  $('authMsg').textContent=''; $('authMsg').className='auth-msg';
}
function toast(msg, ok=false){
  const t=$('toast'); t.textContent=msg; t.classList.remove('hidden');
  t.style.borderColor = ok ? 'rgba(74,222,128,0.3)' : 'var(--border)';
  clearTimeout(t._t); t._t=setTimeout(()=>t.classList.add('hidden'), 2600);
}
function setAuthLoading(v){
  $('authBtn').disabled=v;
  $('authSpinner').classList.toggle('hidden', !v);
  $('authBtnText').style.opacity = v ? '0.7' : '1';
}

switchTab('signin');

// init
const token = localStorage.getItem('token');
const username = localStorage.getItem('username');
if(token){
  showApp();
} else {
  showAuth();
}
function showAuth(){
  authSection.classList.remove('hidden'); appSection.classList.add('hidden');
  userBadge.classList.add('hidden'); logoutBtn.classList.add('hidden');
}
function showApp(){
  authSection.classList.add('hidden'); appSection.classList.remove('hidden');
  userBadge.classList.remove('hidden'); logoutBtn.classList.remove('hidden');
  const name = localStorage.getItem('username') || 'there';
  userBadge.textContent = '@' + name;
  const h = new Date().getHours();
  $('greet').textContent = h<12 ? `Good morning, ${name}` : h<18 ? `Good afternoon, ${name}` : `Good evening, ${name}`;
  $('subgreet').textContent = new Date().toLocaleDateString('en-US', {weekday:'long', month:'long', day:'numeric'});
  loadTodos();
}
function logout(){
  localStorage.removeItem('token'); localStorage.removeItem('username');
  showAuth(); toast('Logged out', true);
}

async function handleAuth(e){
  e.preventDefault();
  const username = $('username').value.trim();
  const password = $('password').value.trim();
  if(!username || !password) return;
  setAuthLoading(true);
  $('authMsg').textContent='';
  try{
    const res = await fetch(`${API}/${mode}`, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if(!res.ok) throw new Error(data.message || 'Failed');
    if(mode==='signup'){
      toast('Account created — please sign in', true);
      switchTab('signin');
      $('authMsg').textContent='Account created! Now sign in.'; $('authMsg').className='auth-msg ok';
    } else {
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', username);
      toast('Welcome back!', true);
      showApp();
    }
  }catch(err){
    $('authMsg').textContent = err.message; $('authMsg').className='auth-msg err';
    toast(err.message);
  }finally{ setAuthLoading(false); }
}

async function loadTodos(){
  const token = localStorage.getItem('token');
  if(!token) return showAuth();
  try{
    const res = await fetch(`${API}/todos`, { headers:{ token } });
    const data = await res.json();
    if(!res.ok) throw new Error(data.message || 'Failed to load');
    const todos = data.todos || data.todo || [];
    render(todos);
  }catch(err){
    if(err.message.includes('Token') || err.message.includes('invalid')){
      localStorage.removeItem('token'); showAuth(); toast('Session expired, please sign in');
    } else toast(err.message);
  }
}
function render(todos){
  const list=$('todoList'), empty=$('emptyState');
  $('todoCount').textContent = todos.length;
  list.innerHTML='';
  if(!todos.length){ empty.classList.remove('hidden'); return; }
  empty.classList.add('hidden');
  todos.forEach(t=>{
    const el=document.createElement('div'); el.className='todo';
    el.innerHTML = `
      <div class="todo-check">○</div>
      <div class="todo-main">
        <h4>${escapeHtml(t.title)}</h4>
        ${t.desc ? `<p>${escapeHtml(t.desc)}</p>` : ''}
      </div>
      <button class="todo-del" title="Delete" onclick="deleteTodo('${t._id}')">✕</button>
    `;
    list.appendChild(el);
  });
}
function escapeHtml(s){ return String(s).replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])) }

async function addTodo(e){
  e.preventDefault();
  const title=$('titleIn').value.trim(), desc=$('descIn').value.trim();
  if(!title) return;
  const token=localStorage.getItem('token');
  const btn=e.target.querySelector('.btn-add'); const old=btn.textContent; btn.textContent='…'; btn.disabled=true;
  try{
    const res=await fetch(`${API}/todo`, {
      method:'POST',
      headers:{'Content-Type':'application/json', token},
      body: JSON.stringify({ title, desc })
    });
    const data=await res.json();
    if(!res.ok) throw new Error(data.message||'Failed');
    $('titleIn').value=''; $('descIn').value='';
    toast('Added ✨', true);
    loadTodos();
  }catch(err){ toast(err.message); }
  finally{ btn.textContent=old; btn.disabled=false; }
}
async function deleteTodo(id){
  const token=localStorage.getItem('token');
  if(!confirm('Delete this task?')) return;
  try{
    const res=await fetch(`${API}/todo/${id}`, { method:'DELETE', headers:{ token } });
    const data=await res.json();
    if(!res.ok) throw new Error(data.message||'Delete failed');
    toast('Deleted', true);
    loadTodos();
  }catch(err){ toast(err.message); }
}
