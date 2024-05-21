/*
  Класс работы с деревом свойств для Пользователя
*/
class UserTree extends BasicTree
{
  constructor() {
    super();
  }

  /*
    Привязываем обработчики событий к элементам дерева
  */
  bindTreeEvents() {
    var
      els=document.querySelectorAll('#main-content .btn-expand.has-children._new');

    // события для кнопки Expand
    Array.from(els).forEach((b) => {
      bindEvHandler(b,'click',this.expandNode,this);
      b.classList.remove('_new');
    });

    els=document.querySelectorAll('#main-content .node-lbl._new');

    // событие для отображения Описания свойства
    Array.from(els).forEach((l) => {
      bindEvHandler(l,'click',this.toggleNodeDescr,this);
      l.classList.remove('_new');
    });
  }

  /*
    Создаёт узел дерева
  */
  createTreeNode(nodeData) {
    const
      nodeEl=document.createElement('div'),
      lbl=this.createNodeLabel(nodeData),
      expandBtn=this.createNodeExpandBtn(nodeData),
      descr=this.createNodeDescr(nodeData);

    nodeEl.id='node-'+nodeData['idx'].toString();
    nodeEl.classList.add('tree-node');
    nodeEl.append(expandBtn,lbl,descr);

    return nodeEl;
  }

  /*
    Название Свойства
  */
  createNodeLabel(nodeData) {
    const
      lbl=document.createElement('label');

    lbl.id='node-lbl-'+nodeData['idx'].toString();
    lbl.classList.add('node-lbl','_new');
    lbl.innerHTML=` ${nodeData['title']}`;

    return lbl;
  }

  /*
    Кнопка Expand
  */
  createNodeExpandBtn(nodeData) {
    const
      btn=document.createElement('span');

    btn.id='btn-expand-'+nodeData['idx'].toString();
    btn.classList.add('btn-expand','_new');

    btn.style.marginLeft=(
      TREE_LVL_INDENT*parseInt(nodeData['lvl'])   // вычисляем отступ для элемента этого уровня
    ).toString()+'px';

    if (nodeData.childrenCnt !=0) {
      btn.classList.add('has-children');
      btn.innerHTML='&#9658;';
    } else
      btn.innerHTML='&bull;';

    return btn;
  }

  /*
    Описание Свойства
  */
  createNodeDescr(nodeData) {
    const
      d=document.createElement('div');

    d.id='node-descr-'+nodeData['idx'].toString();
    d.classList.add('node-descr');
    d.innerHTML=`&#128396;&nbsp; ${nodeData['descr']}`;

    return d;
  }

  /*
    Клик по кнопке Expand
  */
  expandNode(ev) {
    ev.preventDefault();

    const
      btn=ev.target;

    if (!btn.classList.contains('expanded')) {
      // узел ещё не раскрыт
      const
        parentIdx=btn.id.split('-').slice(-1)[0],
        fd=new FormData();

      fd.append('parentIdx',parentIdx);

      fetch('php/getSubtree.php',{
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
        this.fillSubtree(parentIdx,data);
        btn.classList.add('expanded');
        btn.innerHTML='&#9660;';
      });
    } else {
      // узел был раскрыт - закроем (удалим дочерние элементы)
      const
        els=document.querySelectorAll('#node-'+btn.id.split('-').slice(-1)[0]+' .tree-node');

      Array.from(els).forEach((node) =>
        node.remove()
      );

      btn.classList.remove('expanded');
      btn.innerHTML='&#9658;';
    }
  }

  /*
    Показать/скрыть описание свойства по клику по его Названию
  */
  toggleNodeDescr(ev) {
    ev.preventDefault();

    const
      lbl=ev.target,
      descr=document.getElementById('node-descr-'+lbl.id.split('-').slice(-1)[0]);

    if (!(descr.style.display) || (descr.style.display =='none')) {
      // show
      descr.style.display='inline-block';
    } else {
      // hide
      descr.style.display='none';
    }
  }

} /// --- class UserTree
