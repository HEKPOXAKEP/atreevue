-- --------------------------------------------------------
-- Хост:                         127.0.0.1
-- Версия сервера:               5.7.39 - MySQL Community Server (GPL)
-- Операционная система:         Win32
-- HeidiSQL Версия:              12.3.0.6589
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Дамп структуры базы данных aTreeVue
DROP DATABASE IF EXISTS `aTreeVue`;
CREATE DATABASE IF NOT EXISTS `aTreeVue` /*!40100 DEFAULT CHARACTER SET utf8mb4 */;
USE `aTreeVue`;

-- Дамп структуры для процедура aTreeVue.calcNodeLevel
DELIMITER //
CREATE PROCEDURE `calcNodeLevel`(
	IN `aIdx` INT,
	INOUT `aLvl` INT
)
BEGIN
  /*
    Вспомогательная ХП для рекурсивного вызова из calcNodeLvl()
    Рекурсивно вычисляет уровень заданного узла.
    Уровень корневого узла == 0.
  */
  declare iParentIdx int;

  set max_sp_recursion_depth = 250;

  select parentIdx
  into iParentIdx
  from datatree
  where idx =aIdx;
  
  if (iParentIdx is not null) then
    set aLvl=aLvl+1;
    call calcNodeLevel(iParentIdx,aLvl);
  end if;
END//
DELIMITER ;

-- Дамп структуры для функция aTreeVue.calcNodeLvl
DELIMITER //
CREATE FUNCTION `calcNodeLvl`(
	`aIdx` INT
) RETURNS int(11)
BEGIN
  /*
    Рекурсивно вычисляет уровень заданного узла.
    Уровень корневого узла == 0.
    Вызывает вспомогательную ХП calcNodeLevel()
  */
  declare iLvl int default 0;

  call calcNodeLevel(aIdx,iLvl);
  return iLvl;
END//
DELIMITER ;

-- Дамп структуры для таблица aTreeVue.datatree
CREATE TABLE IF NOT EXISTS `datatree` (
  `idx` int(11) NOT NULL AUTO_INCREMENT,
  `parentIdx` int(11) DEFAULT NULL,
  `title` varchar(50) NOT NULL DEFAULT '',
  `descr` varchar(250) NOT NULL DEFAULT '',
  PRIMARY KEY (`idx`),
  KEY `FK_datatree_datatree` (`parentIdx`),
  CONSTRAINT `FK_datatree_datatree` FOREIGN KEY (`parentIdx`) REFERENCES `datatree` (`idx`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4;

-- Дамп данных таблицы aTreeVue.datatree: ~20 rows (приблизительно)
INSERT INTO `datatree` (`idx`, `parentIdx`, `title`, `descr`) VALUES
	(1, NULL, 'Root 1', 'Root 1 descr'),
	(2, 1, 'Node 1.1', 'Node 1.1 descr'),
	(3, 1, 'Node 1.2', 'Node 1.2 descr'),
	(4, 1, 'Node 1.3', 'Node 1.3 descr'),
	(5, 3, 'Node 1.2.1', 'Node 1.2.1 descr'),
	(6, 3, 'Node 1.2.2', 'Node 1.2.2 descr'),
	(7, 3, 'Node 1.2.3', 'Node 1.2.3 descr'),
	(8, 3, 'Node 1.2.4', 'Node 1.2.4 descr'),
	(9, 6, 'Node 1.2.2.1', 'Node 1.2.2.1 descr'),
	(10, 6, 'Node 1.2.2.2', 'Node 1.2.2.2 descr'),
	(11, NULL, 'Root 2', 'Root 2 descr'),
	(13, 15, 'Node 3.1', 'Node 3.1 descr'),
	(15, NULL, 'Root 3', 'Root 3 descr'),
	(16, 15, 'Объект 3.2', 'Описание объекта 3.2'),
	(17, 11, 'Объект 2.1', 'Описание объекта 2.1'),
	(18, 17, 'Объект 2.1.1', 'Описание объекта 2.1.1'),
	(19, 18, 'Объект 2.1.1.1', 'Описание объекта 2.1.1.1'),
	(20, 19, 'Объект 2.1.1.1.1', 'Описание объекта 2.1.1.1.1'),
	(21, 19, 'Объект 2.1.1.1.2', 'Описание объекта 2.1.1.1.2'),
	(22, 7, 'Объект 1.2.3.1', 'Описание объекта 1.2.3.1');

-- Дамп структуры для процедура aTreeVue.delNode
DELIMITER //
CREATE PROCEDURE `delNode`(
	IN `aIdx` INT
)
BEGIN
  /*
    Дочерение элементы удаляются каскадно
  */
  delete from datatree
  where idx =aIdx;

  select aIdx as idx,0 as err,'Node deleted ok' as msg;
END//
DELIMITER ;

-- Дамп структуры для процедура aTreeVue.doAuth
DELIMITER //
CREATE PROCEDURE `doAuth`(
	IN `aLogin` VARCHAR(50),
	IN `aPasswd` VARCHAR(250)
)
BEGIN
  /*
    Проверяем логин и пароль юзера.
  */
  declare uIdx int;
  
  select idx
  into uIdx
  from users
  where (login =aLogin) and (passwd =sha2(aPasswd,224));
  
  if (uIdx is null) then
    select -1971 as err,'Wrong login or password' as msg;
  else
    select uIdx as idx,0 as err,concat('Your are logged in as ',aLogin) as msg;
  end if;
END//
DELIMITER ;

-- Дамп структуры для процедура aTreeVue.editNode
DELIMITER //
CREATE PROCEDURE `editNode`(
	IN `opCode` TINYINT,
	IN `aIdx` INT,
	IN `aParentIdx` INT,
	IN `aTitle` VARCHAR(50),
	IN `aDescr` VARCHAR(250)
)
BEGIN
  /*
    Работа с узлом дерева.
    opCode: 1 - создать, 2 - редактировать, 3 - удалить
  */
  declare s varchar(50);

  if (opCode =1) then call newNode(aParentIdx,aTitle,aDescr);
  elseif (opCode =2) then call updNode(aIdx,aParentIdx,aTitle,aDescr);
  elseif (opCode =3) then call delNode(aIdx);
  else
    if (opCode is null) then set s='NULL';
    else set s=cast(opCode as char);
    end if;

    select -1971 as err,concat('Invalid opCode: ',s) as msg;
  end if;
END//
DELIMITER ;

-- Дамп структуры для процедура aTreeVue.getChildren
DELIMITER //
CREATE PROCEDURE `getChildren`(
	IN `aParentIdx` INT
)
BEGIN
  /*
    Возвращает список дочерних элементов заданного узла.
    При aParentIdx == null вернёт все корневые элементы.
  */
  if (aParentIdx is not null) then
    select idx,aParentIdx as parentIdx,title,descr,calcNodeLvl(idx) as lvl,hasChildren(idx) as childrenCnt
    from datatree
    where parentIdx =aParentIdx;
  else
    -- выбираем только корневые элементы
    select idx,null as parentIdx,title,descr,0 as lvl,hasChildren(idx) as childrenCnt
    from datatree
    where parentIdx is null;
  end if;
END//
DELIMITER ;

-- Дамп структуры для процедура aTreeVue.getUsers
DELIMITER //
CREATE PROCEDURE `getUsers`(
	IN `aIdx` INT
)
BEGIN
  /*
    Возвращает список зарегистрированных юзеров
    или данные одного юзера по его idx.
  */
  if (aIdx is null) then
    -- возвращаем список
    select idx,login,passwd,Z
    from users;
  else
    -- возвращаем данные одного юзера
    select idx,login,passwd,Z
    from users
    where idx =aIdx;
  end if;
END//
DELIMITER ;

-- Дамп структуры для функция aTreeVue.hasChildren
DELIMITER //
CREATE FUNCTION `hasChildren`(
	`aIdx` INT
) RETURNS int(11)
BEGIN
  /*
    Вернёт к-во дочерних элементов или 0, если таковых нет.
  */
  declare n int;
  
  set n=(select count(*) from datatree where parentIdx =aIdx);
  
  return n;
END//
DELIMITER ;

-- Дамп структуры для процедура aTreeVue.newNode
DELIMITER //
CREATE PROCEDURE `newNode`(
	IN `aParentIdx` INT,
	IN `aTitle` VARCHAR(50),
	IN `aDescr` VARCHAR(250)
)
BEGIN
  /*
    Добавляем узел в дерево
  */
  declare newIdx int;

  insert into datatree(parentIdx,title,descr)
  values(aParentIdx,aTitle,aDescr);

  select last_insert_id() into newIdx;

  select newIdx as idx,0 as err,concat('Node added ok. New id=',cast(newIdx as char)) as msg;
END//
DELIMITER ;

-- Дамп структуры для процедура aTreeVue.registerUser
DELIMITER //
CREATE PROCEDURE `registerUser`(
	IN `aLogin` VARCHAR(50),
	IN `aPasswd` VARCHAR(250),
	IN `aZ` TINYINT
)
BEGIN
  /*
    Регистрация нового юзера.
  */
  declare i int;
  declare iZ tinyint;
  declare newIdx int;

  set i=(select count(*) from users where login =aLogin);
  
  if (i !=0) then
    -- юзер с таким логином уже есть
    select -1971 as err,concat('Login alreadt exists "',aLogin,'"') as msg;
  else
    /*
      Статус пользователя: 1 - активный, -1 - забанен, ну и всё такое
    */
    if (aZ is null) then set iZ=1;
    else set iZ=aZ;
    end if;
  
    insert into users(login,passwd,Z)
    values(aLogin,sha2(aPasswd,224),iZ);
    
    select last_insert_id() into newIdx;
    
    select newIdx as idx,0 as err,concat('User "',aLogin,'" registered ok') as msg;
  end if;
END//
DELIMITER ;

-- Дамп структуры для процедура aTreeVue.updNode
DELIMITER //
CREATE PROCEDURE `updNode`(
	IN `aIdx` INT,
	IN `aParentIdx` INT,
	IN `aTitle` VARCHAR(50),
	IN `aDescr` VARCHAR(250)
)
BEGIN
  /*
    Редактируем узел.
    При изменении parentIdx узел со всеми потомками автоматически
    перемещается под нового родителя.
  */
  if (aIdx =aParentIdx) then
    select aIdx as idx,-1971 as err,'You cannot move a node under itself' as msg;
  else
    update datatree
    set parentIdx=aParentIdx,title=aTitle,descr=aDescr
    where idx =aIdx;

    select aIdx as idx,0 as err,'Node updated ok' as msg;
  end if;
END//
DELIMITER ;

-- Дамп структуры для таблица aTreeVue.users
CREATE TABLE IF NOT EXISTS `users` (
  `idx` int(11) NOT NULL AUTO_INCREMENT,
  `login` varchar(50) NOT NULL,
  `passwd` varchar(250) NOT NULL,
  `Z` tinyint(4) NOT NULL,
  PRIMARY KEY (`idx`),
  UNIQUE KEY `idxLogin` (`login`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4;

-- Дамп данных таблицы aTreeVue.users: ~2 rows (приблизительно)
INSERT INTO `users` (`idx`, `login`, `passwd`, `Z`) VALUES
	(1, 'admin1', 'a3ed6082feb67d0b8561b6bd314e447d4b61c2371ef5b51e069a22bf', 1),
	(2, 'admin2', '6030ac83a0166e3ce073811a223d7a673ca3cfa67a4926fa57907f65', 1);

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
