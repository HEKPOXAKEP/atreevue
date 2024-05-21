<?php
/*
  Разлогининг
*/
require_once('common.php');

$_SESSION['user_id']=null;

exit(json_encode(array('err'=>0,'msg'=>'Вы вышли из приложения')));
?>
