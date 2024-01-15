import React, { useEffect } from 'react';
// @mui
import { Box } from '@mui/material';
// type
import { IForgeToken } from 'src/shared/types/forgeToken';
// apis
import forgesApi from 'src/api/forgesApi';
// -------------------------------------------------------------------

type PreviewForgeProps = {
  previewUrn: string,
};

function PreviewForgeComponent({ previewUrn }: PreviewForgeProps) {
  const Autodesk = window.Autodesk;
  let viewer: any;

  const initForgeViewerSingle = async (urn: string) => {
    const tokenRes: IForgeToken = await forgesApi.getToken() as IForgeToken;
    const options = {
      env: 'AutodeskProduction',
      getAccessToken: async (onSuccess: any) => {
        var accessToken, expire;
        accessToken = tokenRes.access_token;
        expire = tokenRes.expires_in;
        onSuccess(accessToken, expire);
      }
    }

    Autodesk.Viewing.Initializer(options, async () => {
      const existing_viewer = document.getElementsByClassName('forgeViewer.adsk-viewing-viewer');
      for (let i = existing_viewer.length - 1; i >= 0; --i) {
        existing_viewer[i].remove();
      }
      const htmlDiv = document.getElementById('previewForgeViewer');
      
      if (htmlDiv !== null) {
        Autodesk.Viewing.Initializer(options, () => {
          viewer = new Autodesk.Viewing.GuiViewer3D(
            htmlDiv, { extensions: [ 'Autodesk.DocumentBrowser' ] }
          );
          const startedCode = viewer.start();
          if (startedCode > 0) {
            console.error('Failed to create a Viewer: WebGL not supported.');
            return;
          }
          var documentId = 'urn:' + urn;
          const onDocumentLoadSuccess = (doc: any) => {
            var viewables = doc.getRoot().getDefaultGeometry();
            if (viewer) {
              viewer.loadDocumentNode(doc, viewables);
            }
          }
          const onDocumentLoadFailure = (viewerErrorCode: any, viewerErrorMsg: any) => {
            console.error('onDocumentLoadFailure() - errorCode:' + viewerErrorCode + '\n- errorMessage:' + viewerErrorMsg);
          }

          Autodesk.Viewing.Document.load(documentId, onDocumentLoadSuccess, onDocumentLoadFailure);
          const handleFinishLoaded = () => {
            const viewerToolbar = viewer.getToolbar(true);            
            if (viewerToolbar) {
              const settingsControl = viewerToolbar.getControl(Autodesk.Viewing.TOOLBAR.SETTINGSTOOLSID);
              if (settingsControl) {
                const fullscreenControl = settingsControl.getControl('toolbar-fullscreenTool');
                fullscreenControl.setVisible(false);
              }
            }
          }
          viewer.addEventListener(Autodesk.Viewing.TOOLBAR_CREATED_EVENT, handleFinishLoaded);
        });
      }
      
    });
  };

  useEffect(() => {
    if (previewUrn !== '') {
      initForgeViewerSingle(previewUrn);
    }
  }, [previewUrn]);

  return (
    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flexGrow: 1, display: 'flex', overflow: 'hidden' }}>
        <Box id='center' sx={{ display: 'flex', flexGrow: 1, position: 'relative' }}>
          <Box id="previewForgeViewer" />
        </Box>
      </Box>
    </Box>
  )
}

PreviewForgeComponent.propTypes = {}

export default PreviewForgeComponent;
