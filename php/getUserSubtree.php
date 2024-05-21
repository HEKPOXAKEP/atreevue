<?php
/*
  Возвращает поддерево для юзера
*/

if (is_null($_POST['parentIdx']) || $_POST['parentIdx'] =='null')
  $pidx = null;
else
  $pidx = $_POST['parentIdx'];

$stmt=$conn->prepare('call getChildren(:aParentIdx)');
$stmt->execute(['aParentIdx'=>$pidx]);

$rez=[];

while ($row=$stmt->fetch(PDO::FETCH_ASSOC)) {
  $rez[]=$row;
}

exit(json_encode($rez));
?>
