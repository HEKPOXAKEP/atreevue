<?php

// параметры подключения к БД через PDO
$dbc=[
  'host'=>'localhost',
  'name'=>'aTreeVue',
  'user'=>'root',
  'pwd'=>'',
  'encoding'=>'utf8'
];

$conn = null;  // глобальный объект соединения с БД

function connectDb() {
  global $dbc,$conn;

  $dsn="mysql:host={$dbc['host']};dbname={$dbc['name']};charset={$dbc['encoding']}";

  $conn = new PDO($dsn,$dbc['user'],$dbc['pwd']);
  $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
}

/*
  Проверяет, авторизирован ли пользователь и если нет,
  пытается авторизировать.
*/
function doLogin($l, $p) {
  global $conn;

  if (isAuth()) {
    return array('user_id'=>$_SESSION['user_id'],'err'=>0,'msg'=>'Пользователь уже авторизован');
  }

  $stmt=$conn->prepare('call doAuth(:aLogin,:aPasswd)');

  $stmt->execute([
    'aLogin'=>$l,
    'aPasswd'=>$p
  ]);

  $rez=$stmt->fetch(PDO::FETCH_ASSOC);

  if ($rez['err'] ==0) {
    // авторизация прошла успешно
    $_SESSION['user_id']=$rez['idx'];
    return array('user_id'=>$rez['idx'],'err'=>$rez['err'],'msg'=>$rez['msg']);
  } else {
    // что-то пошло не так...
    return array('user_id'=>-1,'err'=>$rez['err'],'msg'=>$rez['msg']);
  }
}

?>
