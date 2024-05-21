<?php
/*
  Возвращает дерево для админа
*/
$pidx=null; // начинаем с корневых узлов
$rez=[];    // результирующий массив дерева

function doRecursion(&$pidx,&$rez) {
  global $conn;

  $stmt=$conn->prepare('call getChildren(:aParentIdx)');
  $stmt->execute(['aParentIdx'=>$pidx]);

  $a=$stmt->fetchAll(PDO::FETCH_ASSOC);
  $stmt->closeCursor();

  foreach($a as $row) {
    $rez[]=$row;

    if ($row['childrenCnt'] >0) {
      $pidx=$row['idx'];
      doRecursion($pidx,$rez);
    }
  }
}

doRecursion($pidx,$rez);   // do it, buddy!
exit(json_encode($rez));   // submit result to client
?>
