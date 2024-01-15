import { useEffect, useReducer, useState, useCallback } from 'react';
// next
import Head from 'next/head';
// @mui
import { Stack, Button, Container, Typography } from '@mui/material';
// routes
import { PATH_DASHBOARD } from 'src/routes/paths';
// layouts
import DashboardLayout from 'src/layouts/dashboard';
// components
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { useSettingsContext } from 'src/components/settings';
import { useTable, getComparator } from 'src/components/table';
import Iconify from 'src/components/iconify';
import LoadingWindow from 'src/components/loading-screen/LoadingWindow';
// sections
import {
  NewCustomerDialog,
  CustomerListView,
  CustomerAppsDialog,
  CustomerContractDialog,
  CustomerGridView,
  CustomerFilterName,
} from 'src/sections/@dashboard/bimnextadmin/customers';
import ChangeViewButton from 'src/sections/utis/ChangeViewButton';
// locales
import { useLocales } from 'src/locales';
// AuthContext
import { useAuthContext } from 'src/auth/useAuthContext';
// apis
import customersApi from 'src/api/customersApi';
import mainTasksApi from 'src/api/mainTasksApi';
// type
import { ICustomer, ICustomerResGetAll } from 'src/shared/types/customer';
// zustand store
import useCustomer from 'src/redux/customerStore';
import { shallow } from 'zustand/shallow';
import { DeleteData } from 'src/shared/types/deleteData';
// enums
import { Approved, DataTableEnum, TaskCategory, UserClassEnum, UserRoleEnum } from 'src/shared/enums';
import { IMainTask } from 'src/shared/types/mainTask';
import { IUser } from 'src/shared/types/user';
import userclassesApi from 'src/api/userclassesApi';
import { IUclass, IUclassResGetAll } from 'src/shared/types/uclass';
import { IGroup, IGroupResGetAll } from 'src/shared/types/group';
import groupsApi from 'src/api/groupsApi';
import groupusersApi from 'src/api/groupusersApi';
import { ILocalState } from 'src/containers/forge/forge.container';
import discussionsApi from 'src/api/discussionsApi';
import { IDiscussion } from 'src/shared/types/discussion';
import { useSnackbar } from 'src/components/snackbar';
import { IRequestReqCreate } from 'src/shared/types/request';
import { IFolder } from 'src/shared/types/folder';
import requestsApi from 'src/api/requestsApi';
import forgeObjectsApi from 'src/api/forgeObjectsApi';
import { IForgeObject } from 'src/shared/types/forgeObject';
import filesApi from 'src/api/filesApi';
import { IFile } from 'src/shared/types/file';

import { renameString } from 'src/shared/helpers/stringHelpers';
import markupsApi from 'src/api/markupsApi';
import { IMarkup, IMarkupV3 } from 'src/shared/types/markup';
// ----------------------------------------------------------------------

CustomersManagerPage.getLayout = (page: React.ReactElement) => <DashboardLayout>{page}</DashboardLayout>;

// ----------------------------------------------------------------------

type LocalState = {
  isLoading: boolean,
  finGroup: boolean,
}

export default function CustomersManagerPage() {
  const { translate } = useLocales();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuthContext();

  const {
    customers,
    loading,
    setCustomers,
    countCustomers,
    replaceCustomer,
    removeCustomer,
    setSelectedCustomer,
    setLoading,
  } = useCustomer(
    (state) => ({ 
      customers: state.datas,
      loading: state.loading,
      setCustomers: state.setDatas,
      countCustomers: state.countDatas,
      replaceCustomer: state.replaceData,
      removeCustomer: state.removeData,
      setSelectedCustomer: state.setSelectedData,
      setLoading: state.setLoading,
    }),
    shallow
  );

  const [localState, setLocalState] = useState<LocalState>({
    isLoading: false,
    finGroup: false,
  });

  const { themeStretch } = useSettingsContext();

  const loadAllCustomer = useCallback(async () => {
    const apiRes: ICustomerResGetAll = await customersApi.getCustomer(null);
    setCustomers(apiRes.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAllCustomer();
  }, [user]);



  const syncGroup = async () => {
    // Kiểm tra quyền superadmin
    if (user?.role !== UserRoleEnum.SuperAdmin) {
      enqueueSnackbar(`Bạn không được phép thực hiện chức năng này`, {
        variant: "error",
        autoHideDuration: 10000,
        anchorOrigin: { vertical: "bottom", horizontal: "center" }
      });
      return;
    }

    setLocalState((prevState: LocalState) => ({ ...prevState, isLoading: true }));
    const groupsRes: IGroupResGetAll = await groupsApi.getByCustomer(user?.customer._id);
    for (const gri of groupsRes.data) {
      const usersInGroupi = await groupusersApi.getByGroup(gri._id);
      if (usersInGroupi.data.length > 0) {
        for (const gruser of usersInGroupi.data) {
          // Tìm userClass của người dùng tương ứng với customer hiện hành
          const params = { customerId: user?.customer._id, userId: gruser.user._id };
          const userclassiRes: IUclassResGetAll = await userclassesApi.getUserClass(params);
          if (userclassiRes.data.length > 0) {
            const usi: IUclass = userclassiRes.data[0];
            await userclassesApi.updateById(usi._id, { 
              groupId: gri._id,
              groupName: gri.groupname,
              groupTitle: gri.title,
              isKey: gruser.isKey,
              updatedById: user?.id,
              updatedByName: user?.username,
            });
          }

        }
      }
    }
    setLocalState((prevState: LocalState) => ({ ...prevState, isLoading: false }));
  }
  
  const addTaskCreatedGroup = async () => {
    // Kiểm tra quyền superadmin
    if (user?.role !== UserRoleEnum.SuperAdmin) {
      enqueueSnackbar(`Bạn không được phép thực hiện chức năng này`, {
        variant: "error",
        autoHideDuration: 10000,
        anchorOrigin: { vertical: "bottom", horizontal: "center" }
      });
      return;
    }

    setLocalState((prevState: LocalState) => ({ ...prevState, isLoading: true }));
    const allTasks = await mainTasksApi.upgradev3FindAll(user?.customer._id);
    for (const taski of allTasks) {
      const createdBy = (taski as IMainTask).createdBy as IUser;
      const uParams = {
        userId: createdBy._id,
        customerId: user?.customer._id,
      }
      const uclassRes = await userclassesApi.getUserClass(uParams);
      if (uclassRes.data.length === 1) {
        const groupId = (uclassRes.data[0] as IUclass).groupId;
        // Cập nhật task
        if (taski.category.toString() === "PdfCollaboration") {
          await mainTasksApi.updateById(
            (taski as IMainTask)._id,
            {
              category: TaskCategory.OfficeCollaboration,
              createdGroup: groupId,
              view: 0,
              updatedName: createdBy.username,
              updatedId: createdBy._id
            }
          );
        } else {
          await mainTasksApi.updateById(
            (taski as IMainTask)._id,
            {
              createdGroup: groupId,
              view: 0,
              updatedName: createdBy.username,
              updatedId: createdBy._id
            }
          );
        }
      }
    }
    setLocalState((prevState: LocalState) => ({ ...prevState, isLoading: false }));
  }

  const syncGeneralDiscussions = async () => {
    // Kiểm tra quyền superadmin
    if (user?.role !== UserRoleEnum.SuperAdmin) {
      enqueueSnackbar(`Bạn không được phép thực hiện chức năng này`, {
        variant: "error",
        autoHideDuration: 10000,
        anchorOrigin: { vertical: "bottom", horizontal: "center" }
      });
      return;
    }

    setLocalState((prevState: LocalState) => ({ ...prevState, isLoading: true }));
    const allTasks = await mainTasksApi.upgradev3FindAll(user?.customer._id);

    // 1. Thảo luận tại General Discussion
    // Lọc các task là General Discussion
    const genDiscussTasks = allTasks.filter((e) => e.category === TaskCategory.GeneralDiscussion);
    for (const taski of genDiscussTasks) {
      const taskData = taski as IMainTask;

      const disParams = {
        relativeid: taskData._id,
      }
      const allDiscussionsRes = await discussionsApi.upgradev3GetAllDiscussions(disParams);
      if (allDiscussionsRes.data.length > 0) {
        for (const disi of allDiscussionsRes.data) {
          const discussioni = disi as IDiscussion;

          const createdBy = discussioni.from as IUser;
          const uParams = {
            userId: createdBy._id,
            customerId: user?.customer._id,
          }
          const uclassRes = await userclassesApi.getUserClass(uParams);
          if (uclassRes.data.length === 1) {
            const groupId = (uclassRes.data[0] as IUclass).groupId;
            await discussionsApi.updateById(
              discussioni._id,
              {
                customer: user?.customer._id,
                approved: Approved.Approved,
                createdGroup: groupId,
              }
            );
          }
        }
      }
      
    }

    // 2. Thảo luận tại Folder: Bản 2 không có

    // 3. Thảo luận tại File: Bản 2 không có

    // 4. Thảo luận tại File Request Cloud
    // Lọc các task là File Request Cloud
    // const requestDiscussionTasks = allTasks.filter((e) => e.category === TaskCategory.FileRequestCloud);
    // for (const taski of requestDiscussionTasks) {
    //   const taskData = taski as IMainTask;

    //   const disParams = {
    //     relativeid: taskData._id,
    //   }
    //   const allDiscussionsRes = await discussionsApi.upgradev3GetAllDiscussions(disParams);
    //   if (allDiscussionsRes.data.length > 0) {
    //     for (const disi of allDiscussionsRes.data) {
    //       const discussioni = disi as IDiscussion;

    //       const createdBy = discussioni.from as IUser;
    //       const uParams = {
    //         userId: createdBy._id,
    //         customerId: user?.customer._id,
    //       }
    //       const uclassRes = await userclassesApi.getUserClass(uParams);
    //       if (uclassRes.data.length === 1) {
    //         const groupId = (uclassRes.data[0] as IUclass).groupId;
    //         await discussionsApi.updateById(
    //           discussioni._id,
    //           {
    //             customer: user?.customer._id,
    //             approved: Approved.Approved,
    //             createdGroup: groupId,
    //           }
    //         );
    //       }
    //     }
    //   }
      
    // }

    // 5. Thảo luận tại Task: Bản 2 không có

    // 6. Thảo luận tại collaboration, liên kết với các markup

    // 7. Thảo luận tại schedule, liên kết với các ????

    // 8. Thảo luận tại report 360, liên kết với các ???


    
    
    setLocalState((prevState: LocalState) => ({ ...prevState, isLoading: false }));
  }

  const syncRequest = async () => {
    // Kiểm tra quyền superadmin
    if (user?.role !== UserRoleEnum.SuperAdmin) {
      enqueueSnackbar(`Bạn không được phép thực hiện chức năng này`, {
        variant: "error",
        autoHideDuration: 10000,
        anchorOrigin: { vertical: "bottom", horizontal: "center" }
      });
      return;
    }

    setLocalState((prevState: LocalState) => ({ ...prevState, isLoading: true }));
    const allTasks = await mainTasksApi.upgradev3FindAll(user?.customer._id);
    
    // 1. Thảo luận tại Thảo luận tại File Request Cloud
    // Lọc các task là General Discussion
    const requestTasks = allTasks.filter((e) => e.category === TaskCategory.FileRequestCloud);
    for (const taski of requestTasks) {
      const taskData = taski as IMainTask;

      // 1. Tạo request tương ứng task
      const newRequestTaskData: IRequestReqCreate = {
        task: taskData?._id,
        title: taskData.name,
        content: (taskData.description !== '') ? taskData.description : taskData.name,
        folder: taskData.folder as string,
        createdBy: (taskData.createdBy as IUser)._id,
        createdGroup: taskData.createdGroup as string,
        father: '',
      }
  
      const newRequest = await requestsApi.postCreate(newRequestTaskData);


      // 2. Các thảo luận chuyển relativeId từ task sang request
      const disParams = {
        relativeid: taskData._id,
      }
      const allDiscussionsRes = await discussionsApi.upgradev3GetAllDiscussions(disParams);
      if (allDiscussionsRes.data.length > 0) {
        for (const disi of allDiscussionsRes.data) {
          const discussioni = disi as IDiscussion;

          const createdBy = discussioni.from as IUser;
          const uParams = {
            userId: createdBy._id,
            customerId: user?.customer._id,
          }
          const uclassRes = await userclassesApi.getUserClass(uParams);
          if (uclassRes.data.length === 1) {
            const groupId = (uclassRes.data[0] as IUclass).groupId;
            await discussionsApi.updateById(
              discussioni._id,
              {
                relativeid: newRequest._id,
                customer: user?.customer._id,
                approved: Approved.Approved,
                createdGroup: groupId,
              }
            );
          }
        }
      }
      
    }
    setLocalState((prevState: LocalState) => ({ ...prevState, isLoading: false }));
  }

  const syncCollaboraion = async () => {
    // Kiểm tra quyền superadmin
    if (user?.role !== UserRoleEnum.SuperAdmin) {
      enqueueSnackbar(`Bạn không được phép thực hiện chức năng này`, {
        variant: "error",
        autoHideDuration: 10000,
        anchorOrigin: { vertical: "bottom", horizontal: "center" }
      });
      return;
    }

    setLocalState((prevState: LocalState) => ({ ...prevState, isLoading: true }));
    const allTasks = await mainTasksApi.upgradev3FindAll(user?.customer._id);
    
    // 1. Thảo luận tại Thảo luận tại File Request Cloud
    // Lọc các task là General Discussion
    const requestTasks = allTasks.filter((e) => e.category.includes('Collaboration'));
    for (const taski of requestTasks) {
      const taskData = taski as IMainTask;
      const forgeObjParams = {
        task: taskData._id,
      }
      const allForgeObjectRes = await forgeObjectsApi.upgradev3FindAll(forgeObjParams);
      for (const forgeObji of allForgeObjectRes.data) {
        const forgeObject: IForgeObject = forgeObji as IForgeObject;
        const objTest = forgeObject.text;
        const displayName = objTest.slice(0, objTest.lastIndexOf('-'));
        const ext = objTest.slice(objTest.lastIndexOf('.') + 1);
        // tìm dữ liệu file tương ứng
        let fileId: string = '';
        const fileParam = {
          folder: taskData.folder as string,
        }
        const fileSearchRes = await filesApi.getAllLastedFilesInFolder(fileParam);
        for (const fi of fileSearchRes) {
          const filei = fi as IFile;
          const displayFile = filei.storeFile.slice(0, filei.storeFile.lastIndexOf('-'));
          if (renameString(`${displayFile}.${ext}`) === renameString(`${displayName}.${ext}`)) {
            fileId = filei._id;
            // Bổ sung urn cho file.convertFile
            await filesApi.updateById(filei._id, { convertFile: forgeObject.urn });
          }
        }

        // Tìm dữ liệu createdGroup của forge Object
        let createdGroupId = '';
        const uParams = {
          userId: (forgeObject.updatedBy as IUser)._id,
          customerId: user?.customer._id,
        }
        const uclassRes = await userclassesApi.getUserClass(uParams);
        if (uclassRes.data.length === 1) {
          createdGroupId = (uclassRes.data[0] as IUclass).groupId;
        }

        if (fileId !== '' && createdGroupId !== '') {
          // Cập nhật dữ liệu cho forge object
          await forgeObjectsApi.updateById(forgeObject._id, { file: fileId, createdGroup: createdGroupId });
        }

        // Cập nhật dữ liệu cho các markups
        let markupParam = {};
        if (taskData.category === TaskCategory.ModelCollaboration) {
          markupParam = {
            task: taskData._id,
          }
        } else {
          markupParam = {
            task: taskData._id,
            fileid: forgeObject._id,
          }
        }
        
        const allMarkups = await markupsApi.upgradev3FindAllMarkups(markupParam);
        if (allMarkups.data.length > 0) {
          for (const mai of allMarkups.data) {
            const markupi = mai as IMarkupV3;
            // Tìm dữ liệu createdGroup của markup
            let markupCreatedGroupId = '';
            const mParams = {
              userId: markupi.createBy,
              customerId: user?.customer._id,
            }
            const uclassRes = await userclassesApi.getUserClass(uParams);
            if (uclassRes.data.length === 1) {
              markupCreatedGroupId = (uclassRes.data[0] as IUclass).groupId;
            }

            // Cập nhật dữ liệu markup
            if (markupCreatedGroupId !== '') {
              await markupsApi.updateById(markupi._id, { 
                createdBy: markupi.createBy,
                createdGroup: markupCreatedGroupId,
              });
            }

            // Cập nhật dữ liệu cho thảo luận theo các markup
            const disParams = {
              relativeid: markupi._id,
            }
            const allDiscussionsRes = await discussionsApi.upgradev3GetAllDiscussions(disParams);
            if (allDiscussionsRes.data.length > 0) {
              for (const disi of allDiscussionsRes.data) {
                const discussioni = disi as IDiscussion;
      
                const createdBy = discussioni.from as IUser;
                const uParams = {
                  userId: createdBy._id,
                  customerId: user?.customer._id,
                }
                const uclassRes = await userclassesApi.getUserClass(uParams);
                
                if (uclassRes.data.length === 1) {
                  const groupId = (uclassRes.data[0] as IUclass).groupId;
                  upgradeDiscussionContent(discussioni);
                  await discussionsApi.updateById(
                    discussioni._id,
                    {
                      customer: user?.customer._id,
                      approved: Approved.Approved,
                      createdGroup: groupId,
                    }
                  );
                }
              }
            }
          }
        }

        
      }
      
    }
    setLocalState((prevState: LocalState) => ({ ...prevState, isLoading: false }));
  }

  const upgradeDiscussionContent = (disi: IDiscussion) => {
    console.log(disi.content);

    
  }

  return (
    <>
      <Head>
        <title> {`Nâng cấp V3`} </title>
      </Head>

      <Container maxWidth={themeStretch ? false : 'lg'} sx={{ pl: '5px !important', pr: '5px !important' }}>
        <CustomBreadcrumbs
          heading={`Nâng cấp V3`}
          links={[
            {
              name: `${translate('nav.dashboard')}`,
              href: PATH_DASHBOARD.root,
            },
            { name: `Nâng cấp V3` },
          ]}
        />
        
        {(localState.isLoading === true) ?
          <LoadingWindow />
          :
          <Stack
            spacing={2.5}
            direction={{ xs: 'column', md: 'column' }}
            alignItems={{ xs: 'flex-end', md: 'center' }}
            justifyContent="space-between"
            sx={{ mt: 2, mb: 3 }}
          >
            <Button
              variant="contained"
              startIcon={<Iconify icon="ic:round-bookmark-added" />}
              onClick={syncGroup}
            >
              {`Đồng bộ dữ liệu nhóm người dùng`}
            </Button>
            <Typography>
              {'Bổ sung phân loại dự án'}
            </Typography>
            <Button
              variant="contained"
              startIcon={<Iconify icon="ic:round-bookmark-added" />}
              onClick={addTaskCreatedGroup}
            >
              {`Đồng bộ dữ liệu công việc`}
            </Button>
            <Typography>
              {'Duyệt tất cả các Thảo luận chung'}
            </Typography>
            <Button
              variant="contained"
              startIcon={<Iconify icon="ic:round-bookmark-added" />}
              onClick={syncGeneralDiscussions}
            >
              {`Đồng bộ dữ liệu các nội dung thảo luận`}
            </Button>
            <Button
              variant="contained"
              startIcon={<Iconify icon="ic:round-bookmark-added" />}
              onClick={syncRequest}
            >
              {`Đồng bộ dữ liệu request`}
            </Button>
            <Button
              variant="contained"
              startIcon={<Iconify icon="ic:round-bookmark-added" />}
              onClick={syncCollaboraion}
            >
              {`Đồng bộ dữ liệu Collaboration Task`}
            </Button>
          </Stack>
        }
      </Container>
    </>
  );
}