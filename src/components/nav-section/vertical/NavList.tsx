import { useState, useEffect } from 'react';
// next
import { useRouter } from 'next/router';
// @mui
import { Collapse } from '@mui/material';
// hooks
import useActiveLink from '../../../hooks/useActiveLink';
//
import { NavListProps } from '../types';
import NavItem from './NavItem';
// Auth
import { useAuthContext } from 'src/auth/useAuthContext';
// enums
import { UserClassEnum } from 'src/shared/enums';
// ----------------------------------------------------------------------

type NavListRootProps = {
  data: NavListProps;
  depth: number;
  hasChild: boolean;
};

export default function NavList({ data, depth, hasChild }: NavListRootProps) {
  const { pathname } = useRouter();

  const { active, isExternalLink } = useActiveLink(data.path);

  const [open, setOpen] = useState(active);

  useEffect(() => {
    if (!active) {
      handleClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const handleToggle = () => {
    setOpen(!open);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <NavItem
        item={data}
        depth={depth}
        open={open}
        active={active}
        isExternalLink={isExternalLink}
        onClick={handleToggle}
      />

      {hasChild && (
        <Collapse in={open} unmountOnExit>
          <NavSubList data={data.children} depth={depth} />
        </Collapse>
      )}
    </>
  );
}

// ----------------------------------------------------------------------

type NavListSubProps = {
  data: NavListProps[];
  depth: number;
};

function NavSubList({ data, depth }: NavListSubProps) {
  const { user } = useAuthContext();

  return (
    <>
      {data.map((list) => {
        // ======
        let showItem = false;
        if (user?.class === null) {
          if (list.show === UserClassEnum.Admin) {
            showItem = false;
          } else {
            showItem = true;
          }
        } else {
          showItem = list.show === user?.class.uclass;
          if (user?.class.uclass === UserClassEnum.Admin) showItem = true;
          if (user?.projectrole === UserClassEnum.Admin) showItem = true;
        }
        
        // ======
        return (showItem && 
          <NavList
            key={list.title + list.path}
            data={list}
            depth={depth + 1}
            hasChild={!!list.children}
          />
      )})}
    </>
  );
}
