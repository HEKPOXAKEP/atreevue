call registerUser('admin2','qwerty2',1,
  @oIdx,@oErr,@oMsg);
select @oIdx,@oErr,@oMsg;

call getUsers(null);

set @lvl=0;
call calcNodeLevel(10,@lvl);
select @lvl;

call getChildren(6);

select hasChildren(1);

call getTreeRecursive(null,@idx,@parentidx,@title,@descr,@lvl,@childrencnt);
select @idx,@parentidx,@title,@descr,@lvl,@childrencnt

call getFullTree(@idx,@parentidx,@title,@descr,@lvl,@childrencnt);

CREATE DEFINER=`root`@`localhost` PROCEDURE `getTreeRecursive`(
	IN `aParentIdx` INT,
	OUT `oIdx` INT,
	OUT `oParentIdx` INT,
	OUT `oTitle` VARCHAR(50),
	OUT `oDescr` VARCHAR(250),
	OUT `oLvl` INT,
	OUT `childrenCnt` INT
)
LANGUAGE SQL
NOT DETERMINISTIC
CONTAINS SQL
SQL SECURITY DEFINER
COMMENT ''
BEGIN
  declare done int default false;

  declare i int;
  declare p int;
  declare t varchar(50);
  declare d varchar(250);
  declare l int;
  declare c int;

  declare curs_i cursor
    for select idx,parentIdx,title,descr,calcNodeLvl(idx),hasChildren(idx) from datatree
    where ((aParentIdx is null) and (parentIdx is null)) or ((aParentIdx is not null) and (parentIdx =aParentIdx));

  declare continue handler for not found set done=true;

  set max_sp_recursion_depth = 250;

  open curs_i;

  read_loop: loop
    fetch curs_i into oIdx,oParentIdx,oTitle,oDescr,oLvl,childrenCnt;

    if done then
      leave read_loop;
    end if;

    select oIdx,oParentIdx,oTitle,oDescr,oLvl,childrenCnt;

    if (childrenCnt <>0) then
      -- recursion for children of oIdx node
      call getTreeRecursive(oIdx,oIdx,oParentIdx,oTitle,oDescr,oLvl,childrenCnt);
    end if;
  end loop;

  close curs_i;
END
CREATE DEFINER=`root`@`localhost` PROCEDURE `getFullTree`(
	OUT `oIdx` INT,
	OUT `oParentIdx` INT,
	OUT `oTitle` VARCHAR(50),
	OUT `oDescr` VARCHAR(250),
	OUT `oLvl` INT,
	OUT `childrenCnt` INT
)
LANGUAGE SQL
NOT DETERMINISTIC
CONTAINS SQL
SQL SECURITY DEFINER
COMMENT ''
BEGIN
  declare idx int;
  declare parentidx int;
  declare title varchar(50);
  declare descr varchar(250);
  declare lvl int;
  declare childrencnt int;

  call getTreeRecursive(null, idx,parentidx,title,descr,lvl,childrencnt);

  select idx,parentidx,title,descr,lvl,childrencnt
  into oIdx,oParentIdx,oTitle,oDescr,oLvl,childrenCnt;
END

CREATE DEFINER=`root`@`localhost` TRIGGER `bd_datatree` BEFORE DELETE ON `datatree` FOR EACH ROW BEGIN
  /*
    Каскадное удаление дочерних узлов
  */
  delete from datatree
  where parentIdx =OLD.idx;
END
