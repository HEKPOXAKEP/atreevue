/*
  Класс App(lication)
*/

class App
{
  theTree = null;  // объект работы с деревом структуры данных

  // the Constructor
  constructor() {
    this.initialization();
    this.getEntrance();
  }

  /*
    Инициализация глобальных данных
  */
  initialization() {
    loadDashboard();
  }

  /*
    Выводит окно входа: Пользователь/Администратор
  */
  getEntrance() {
    fetch('html/entrance.html')
      .then((response) => response.text())
      .then((data) => {
        document.body.insertAdjacentHTML('beforeend',data);

        bindEvHandler('btn-user','click',this.btnEnterAsClick,this);
        bindEvHandler('btn-admin','click',this.btnEnterAsClick,this);
      });
  }

  /*
    Обработка нажатия кнопок в окне входа: "Пользователь" или "Администратор"
  */
  btnEnterAsClick(ev) {
    var
      btn=ev.target;

    switch(btn.id.split('-').slice(-1)[0]) {
      case 'user':
        removeNodeById('entrance-block');
        this.loadUserUI();
        break;
      case 'admin':
        removeNodeById('entrance-block');
        this.loadLoginDlg();
        break;
      default: msgDlg(_WARN,`Нажата нераспознанная кнопка, id=${btn.id}`);
    }
  }

  /*
    Загрузка интерфейса для обычного Пользователя
    и создание дерева свойств.
  */
  loadUserUI() {
    this.mkMainHeader('Вы вошли, как Пользователь',this.btnLogoutClick);

    this.theTree = new UserTree();
  }

  loadAdminUI(loginData) {
    this.mkMainHeader(`${loginData.username}, Вы вошли, как Администратор`,this.btnLogoutClick);

    this.theTree = new AdminTree();
  }

  /*
    Вывод окна авторизации
  */
  loadLoginDlg() {
    fetch('html/dlg-login.html')
      .then((response) => response.text())
      .then((data) => {
        document.body.insertAdjacentHTML('beforeend',data);

        bindEvHandler('btn-login','click',this.btnLoginClick,this);
        bindEvHandler('btn-cancel','click',this.btnCancelLoginClick,this);
        bindEvHandler('ed-login','input',this.inputFieldChange,this);
        bindEvHandler('ed-passwd','input',this.inputFieldChange,this);
      });
  }

  /*
    При редактировании полей окна авторизации удаляем сообщение об ошибке
  */
  inputFieldChange(ev) {
    document.getElementById('err-info').style.display='none';
  }

  /*
    Обработка кнопки "Login" окна авторизации
  */
  btnLoginClick(ev) {
    ev.preventDefault();

    const
      frmData=new FormData(document.getElementById('frm-login'));

    fetch('php/auth.php',{
      method: 'POST',
      body: frmData
      }
    )
    .then((response) => {
      if (response.ok)
        return response.json();
      else
        return Promise.reject(response);
    })
    .then((data) => {
      if (data.err !=0) {
        // ошибка
        msgDlg(_ERROR,data.msg);

        let
          errInfo=document.getElementById('err-info');

        errInfo.innerHTML=data.msg;
        errInfo.style.display='block';

        switch (data.err) {
          case 1:
            document.getElementById('ed-login').focus();
            break;
          case 2:
            document.getElementById('ed-passwd').focus();
            break;
          default:
        }
      } else {
        // авторизация прошла успешно
        removeNodeById('dlg-login');
        this.loadAdminUI(data);
      }
    })
    .catch((err) => {
      const s = (err.hasOwnProperty('message')) ?
        `Ошибка: ${err.message}`
        :
        (`URL: ${err.url}\rОшибка: ${err.status} - ${err.statusText}`);

      console.log(err); ///
      msgDlg(_ERROR,`Что-то пошло не так.\r\r${s}`);
    });
  }

  /*
    Выход из окна авторизации обратно в окно входа
  */
  btnCancelLoginClick(ev) {
    ev.preventDefault();
    location=location.href;
  }

  /*
    Создаёт главный заголовок
  */
  mkMainHeader(title,logoutHandler) {
    document.getElementById('main-header').innerHTML=title;
    this.createLogoutBtn(logoutHandler);
  }

  /*
    Добавляет в заголовок кнопку "Выход"
  */
  createLogoutBtn(logoutHandler) {
    const
      btn=document.createElement('button');

    btn.id='btn-logout';
    btn.className='rt-float';
    btn.innerHTML='Выход';

    document.getElementById('main-header').appendChild(btn);
    bindEvHandler('btn-logout','click',logoutHandler,this);
  }

  /*
    Обработка кнопки "Выход"
  */
  btnLogoutClick(ev) {
    ev.preventDefault();

    fetch('php/logout.php')
    .then((response) => {
      if (response.ok)
        return response.json();
      else
        return Promise.reject(response);
    })
    .then((data) => {
      //this.clearMainHeader();
      location=location.href;
    })
    .catch((err) => {
      const s = (err.hasOwnProperty('message')) ?
        `Ошибка: ${err.message}`
        :
        (`URL: ${err.url}\rОшибка: ${err.status} - ${err.statusText}`);

      msgDlg(_ERROR,`Что-то пошло не так.\r\r${s}`);
    });
  }

} /// --- class App
