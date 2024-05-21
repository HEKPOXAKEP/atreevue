<?php
/*
  Получение части или всего дерева
*/

require_once('common.php');
require_once('db.php');

connectDb();

if (isAuth())
  require_once('getAdminSubtree.php');
else
  require_once('getUserSubtree.php');
?>
