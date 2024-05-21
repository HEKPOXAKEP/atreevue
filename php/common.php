<?php
session_start();  // стартуем или возобновляем сессию

function isAuth() {
  return isset($_SESSION['user_id']);
}
?>
