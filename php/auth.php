<?php
/*
  Авторизация пользователя
*/

$l = $_POST['ed-login'];
$p = $_POST['ed-passwd'];

if (empty($l))
  exit(json_encode(array('err'=>1,'msg'=>'Не заполнено поле "Логин"')));

if (empty($p))
  exit(json_encode(array('err'=>2,'msg'=>'Не заполнено поле "Пароль"')));

require_once('common.php');
require_once('db.php');

connectDb();

$rez=doLogin($l,$p);

exit(json_encode(array('user_id'=>$rez['user_id'],'username'=>$l,'err'=>$rez['err'],'msg'=>$rez['msg'])));
?>
