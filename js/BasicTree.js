/*
  Базовый класс работы с деревьями
*/
class BasicTree
{
  constructor() {
    this.loadTree();
  }

  /*
    Загрузка (под)дурева
  */
  loadTree() {
    const
      fd=new FormData();

    fd.append('parentIdx',null);

    fetch('php/getSubtree.php',{
      method: 'POST',
      body: fd
      /*credentials: 'include',
      headers: {'Content-Type': 'application/json'}*/
    })
    .then((response) => {
      if (response.ok)
        return response.json();
      else
        return Promise.reject(response);
    })
    .then((data) => {
      this.fillSubtree(null,data);
    });
  }

  /*
    Заполняем блок дерева
  */
  fillSubtree(parentIdx,treeData) {
    var
      tt=[],
      parentEl;

    for (let i in treeData) tt[i] = treeData[i];

    if (parentIdx ===null) {
      // выводим корневые узлы
      parentEl = document.getElementById('main-content');
    } else {
      // выводим дочерние элементы узла parentIdx
      parentEl = document.getElementById('node-'+parentIdx.toString());
    }

    tt.forEach((nodeData) =>
      parentEl.appendChild(this.createTreeNode(nodeData)) );

    this.bindTreeEvents();
  }

  /*
    Привязываем обработчики событий для элементов дерева
  */
  bindTreeEvents() {
    throw new Error('Method "bindTreeEvents" must be implemented.');
  }

  /*
    Создаёт узел дерева
  */
  createTreeNode(nodeData) {
    throw new Error('Method "createTreeNode" must be implemented.');
  }
} /// --- class BasicTree
