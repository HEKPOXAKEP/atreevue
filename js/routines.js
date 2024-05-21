/*
  Разные функции
*/

function msgDlg(msgType,msg) {
  if (msgType !='') msg=msgType+'\r\r'+msg;
  alert(msg);
}

/*
  Удаляет элемент по его Id
*/
function removeNodeById(id) {
  document.getElementById(id).remove();
}

/*
  Привязываем событие evType элемента el к методу evHandler объекта thisObj
*/
function bindEvHandler(el,evType,evHandler,thisObj) {
  if (typeof el ==='string') el=document.getElementById(el);

  if (typeof el !=='object')
    msgDlg(_ERROR,`Couldn\'t bind event handler to ${el}`);
  else
    el.addEventListener(evType,evHandler.bind(thisObj),false);
}

/*
  Загрузка панели управления деревом
*/
function loadDashboard() {
  fetch('html/dashboard.html')
    .then((response) => response.text())
    .then((data) => 
      document.getElementById('main-header').insertAdjacentHTML('afterend',data) )
    .catch((err) =>
      console.log('loadDashboard: ',err) );
}

/*
  Показывает/скрывает панель управления деревом
*/
function toggleDashboard(show) {
  const
    tb=document.getElementById('dashboard');

  if (show)
    tb.style.display='flex';
  else
    tb.style.display='none';
}
