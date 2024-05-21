<?php
/*
  Создание, редактирование, удаление узла дерева.

  opCode: 1 - создать, 2 - редактировать, 3 - удалить
*/
require_once('common.php');

if (!isAuth()) {
  exit(json_encode(array('err'=>-1971,'msg'=>'У вас нет прав для выполнения этой операции.')));
}

require_once('db.php');

$opCode=$_POST['opCode'];

$pidx=isset($_POST['parentIdx']) ? (strtolower($_POST['parentIdx']) ==='null' ? null : $_POST['parentIdx']) : null;
$idx=isset($_POST['idx']) ? (strtolower($_POST['idx']) ==='null' ? null : $_POST['idx']) : null;
$title=trim(isset($_POST['title']) ? $_POST['title'] : '-none-');
$descr=trim(isset($_POST['descr']) ? $_POST['descr'] : '');

connectDb();

$stmt=$conn->prepare('call editNode(:opCode,:aIdx,:aParentIdx,:aTitle,:aDescr)');
$stmt->execute([
  'opCode'=>$opCode,
  'aIdx'=>$idx,
  'aParentIdx'=>$pidx,
  'aTitle'=>$title,
  'aDescr'=>$descr
]);

$rez=$stmt->fetch(PDO::FETCH_ASSOC);

exit(json_encode($rez));
?>
