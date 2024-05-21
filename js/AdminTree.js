/*
  Класс работы с деревом свойств для Администратора
*/
class AdminTree extends BasicTree
{
  selectedNodeIdx=null;
  editorMode=false;

  constructor() {
    super();
    this.bindDashboardEvents();
    toggleDashboard(true);
  }

  loadTree() {
    this.selectedNodeIdx=null;
    this.setEditorMode(false);

    document.getElementById('main-content').innerHTML='';
    document.getElementById('fld-node-parent').innerHTML='<option value="null">-отсутствует-</option>';

    super.loadTree();
  }

  /*fillSubtree(parentIdx,treeData) {
    super.fillSubtree(parentIdx,treeData);
  }*/

  /*
    Привязываем обработчики событий к элементам дерева
  */
  bindTreeEvents() {
    var
      els=document.querySelectorAll('input[type="radio"][name="selected-node"]');

    // выбор узла в дереве
    Array.from(els).forEach((b) =>
      bindEvHandler(b,'change',this.selectNode,this)
    );

    this.showNodeInfo();
  }

  /*
    Привязваем обработчики к кнопкам панели управления деревом
  */
  bindDashboardEvents() {
    bindEvHandler('btn-new-node','click',this.btnNewNodeClick,this);
    bindEvHandler('btn-edit-node','click',this.btnEditNodeClick,this);
    bindEvHandler('btn-del-node','click',this.btnDelNodeClick,this);
    bindEvHandler('btn-editor-mode','click',this.btnEditorModeClick,this);
  }

  /*
    Создаёт узел дерева со всей обвязкой
  */
  createTreeNode(nodeData) {
    const
      nodeEl=document.createElement('div'),
      sel=this.createNodeRadio(nodeData),
      lbl=this.createNodeLabel(nodeData,sel.id),
      descr=this.createNodeDescr(nodeData);

    nodeEl.id='node-'+nodeData['idx'].toString();
    nodeEl.classList.add('tree-node');
    nodeEl.append(sel,lbl,descr);

    // добавляем этот узел в выпадающий список родителей
    this.addSelectParentOption(nodeData);

    return nodeEl;
  }

  createNodeRadio(nodeData) {
    const
      r=document.createElement('input');

    r.id='node-radio-'+nodeData['idx'].toString();
    r.type='radio';
    r.name='selected-node';
    r.value=nodeData['idx'].toString();

    r.style.marginLeft=(
      TREE_LVL_INDENT*parseInt(nodeData['lvl'])   // вычисляем отступ для элемента этого уровня
    ).toString()+'px';

    if (this.selectedNodeIdx ===null) {
      r.checked=true;
      this.selectedNodeIdx=nodeData['idx'];
    }

    return r;
  }

  /*
    Название Свойства
  */
  createNodeLabel(nodeData,forId) {
    const
      lbl=document.createElement('label');

    lbl.id='node-lbl-'+nodeData['idx'].toString();
    lbl.setAttribute('for',forId);
    lbl.classList.add('node-lbl');
    if (nodeData['parentIdx'] ==null)
      lbl.setAttribute('data-parentidx','null');
    else
      lbl.setAttribute('data-parentidx',nodeData['parentIdx'].toString());
    lbl.innerHTML=` ${nodeData['title']}`;

    return lbl;
  }

  /*
    Описание Свойства
  */
  createNodeDescr(nodeData) {
    const
      d=document.createElement('div');

    d.id='node-descr-'+nodeData['idx'].toString();
    d.classList.add('node-descr');
    d.style.display='inline-block';
    ///d.innerHTML=`&#128396; ${nodeData['descr']}`;
    d.innerHTML=' | <span>'+nodeData['descr']+'</span>';

    return d;
  }

  /*
    Добавляем элемент в список родителей
  */
  addSelectParentOption(nodeData) {
    const
      op=document.createElement('option');

    op.value=nodeData['idx'];
    op.innerHTML='-'.repeat(nodeData['lvl'])+' '+nodeData['title']
    document.getElementById('fld-node-parent').appendChild(op);
  }

  /*
    Выбор узла
  */
  selectNode(ev) {
    ev.preventDefault();

    const
      sel=document.querySelector('input[name="selected-node"]:checked');


    this.selectedNodeIdx = (sel ===null) ? null : sel.value;
    this.setEditorMode(false);
    this.showNodeInfo();
  }

  showNodeInfo() {
    const
      fparent=document.getElementById('fld-node-parent'),
      ftitle=document.getElementById('fld-node-title'),
      fdescr=document.getElementById('fld-node-descr');

    if (this.selectedNodeIdx ===null) {
      fparent.value='nul';
      ftitle.value='';
      fdescr.value='';
    } else {
      fparent.value=document.getElementById('node-lbl-'+this.selectedNodeIdx).getAttribute('data-parentidx');
      ftitle.value=document.getElementById('node-lbl-'+this.selectedNodeIdx).innerHTML.trim();
      fdescr.value=document.querySelector('#node-descr-'+this.selectedNodeIdx+'>span').innerText;
        /*document.getElementById('node-descr-'+this.selectedNodeIdx).innerHTML
        .normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9 ]/g,'').trim();*/
    }
  }

  prepareFormData(opCode) {
    if (this.selectedNodeIdx ===null) {
      msgDlg(_ERROR,'Узел не выбран');
      return null;
    }

    const
      fd=new FormData();

    fd.append('opCode',opCode);
    fd.append('idx',this.selectedNodeIdx);
    fd.append('parentIdx',document.getElementById('fld-node-parent').value);

    var
      nt=document.getElementById('fld-node-title'),
      aTitle=nt.value.trim();
    if (aTitle =='') {
      nt.focus();
      msgDlg(_ERROR,'Заполните поле "Название".');
      return null;
    }
    fd.append('title',aTitle);
    fd.append('descr',document.getElementById('fld-node-descr').value);

    return fd;
  }

  btnNewNodeClick(ev) {
    const
      fd=this.prepareFormData(1);

    if (fd ===null) return;

    this.callEditTreeNode(fd);
  }

  btnEditNodeClick(ev) {
    const
      fd=this.prepareFormData(2);

    if (fd ===null) return;

    this.callEditTreeNode(fd);
  }

  btnDelNodeClick(ev) {
    if (confirm(_CONFIRM+'\rУдалить объект '+document.getElementById('node-lbl-'+this.selectedNodeIdx).innerHTML.trim()+
      ' и всех его потомков?\rВы хорошо подумали?')) {
      const
        fd=this.prepareFormData(3);

      if (fd ===null) return;

      this.callEditTreeNode(fd);
    }
  }

  /*
    Выполняет выбранную операцию (opCode) над узлом на сервере.
  */
  callEditTreeNode(fd) {
    this.setEditorMode(false);

    fetch('php/editTreeNode.php',{
      method: 'POST',
      body: fd
    })
    .then((response) => {
      if (response.ok)
        return response.json();
      else
        return Promise.reject(response);
    })
    .then((data) => {
      if (data.err !=0) {
        msgDlg(_ERROR,data.msg);
      } else {
        msgDlg(_INFO,data.msg);
        this.loadTree();
      }
    })
    .catch((err) => {
      const s = (err.hasOwnProperty('message')) ?
        `Ошибка: ${err.message}`
        :
        (`URL: ${err.url}\rОшибка: ${err.status} - ${err.statusText}`);

      console.log(err);
      msgDlg(_ERROR,`Что-то пошло не так.\r\r${s}`);
    });
  }

  /*
    Кнопка включения/выключения режима редактирования
  */
  btnEditorModeClick(ev) {
    ev.preventDefault();

    this.setEditorMode(!this.editorMode);
  }

  /*
    Включение/выключение режима редактирования
  */
  setEditorMode(onOff) {
    this.editorMode=onOff;

    const
      els=document.querySelectorAll('#dashboard .ed-mode-dependent');

    Array.from(els).forEach((el) => {
      if (this.editorMode)
        el.removeAttribute('disabled');
      else
        el.setAttribute('disabled','disabled');
    });
  }

} /// --- class AdminTree
