import React from 'react';
import { shallow } from 'zustand/shallow';
//mui
import { Button } from '@mui/material';
//next
import NextLink from 'next/link';
//router
import { PATH_DASHBOARD } from '../../../../routes/paths';
//locales
import { useLocales } from '../../../../locales';
//store
import useBimBlogStore from '../../../../redux/blogStore/bimBlogStore';
import useBimBlogDefaultStore from '../../../../redux/blogStore/bimBlogDefaultStore';
//component
import Iconify from '../../../../components/iconify/Iconify';
//-----------------------------------------------
export default function BlogNewPostButton() {
  const { translate } = useLocales();
  const { setContentPost } = useBimBlogStore(
    (state) => ({
      setContentPost: state.setContentPost
    }),
    shallow
  );
  const { setSelectedPost } = useBimBlogDefaultStore(
    (state) => ({
      setSelectedPost: state.setSelectedData
    }),
    shallow
  );
  return (
    <Button
      component={NextLink}
      href={PATH_DASHBOARD.blog.new}
      variant="contained"
      startIcon={<Iconify icon="eva:plus-fill" />}
      className=" breadcrumbs-button button__new"
      onClick={() => {
        setSelectedPost(null);
        setContentPost('');
      }}>
      {`${translate('blog.new_post')}`}
    </Button>
  );
}
