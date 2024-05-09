import * as React from 'react';
import {
  Alert,
  Button,
  Form,
  FormAlert,
  FormGroup,
  Spinner,
  TextArea,
  TextInput,
  spinnerSize,
  Modal,
  ModalVariant,
} from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useK8sModel, k8sCreate } from '@openshift-console/dynamic-plugin-sdk';

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ close }) => {
  const { t } = useTranslation('plugin__console-plugin-template');
  const [inProgress, setInProgress] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string>('');
  const [name, setName] = React.useState('');
  const [displayName, setDisplayName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [model] = useK8sModel({
    group: 'project.openshift.io',
    version: 'v1',
    kind: 'ProjectRequest',
  });

  const createProject = React.useCallback(async () => {
    const data = {
      metadata: {
        name,
      },
      displayName,
      description,
    };
    return k8sCreate({ model, data });
  }, [description, displayName, name]);

  const create = () => {
    setInProgress(true);
    setErrorMessage('');
    createProject()
      .then(() => {
        setErrorMessage('');
        close();
      })
      .catch((err) => {
        setErrorMessage(err);
        // eslint-disable-next-line no-console
        console.error(`Failed to create Project:`, err);
      })
      .finally(() => {
        setInProgress(false);
      });
  };

  return (
    <Modal
      variant={ModalVariant.small}
      isOpen
      showClose={false}
      title={t('Create project')}
      description={t('Provided by the console plugin template!')}
      actions={
        inProgress
          ? [<Spinner key="spinner" size={spinnerSize.sm} />]
          : [
              <Button
                key="create"
                variant="primary"
                onClick={create}
                disabled={inProgress}
              >
                {t('Create')}
              </Button>,
              <Button
                key="cancel"
                variant="link"
                onClick={close}
                disabled={inProgress}
              >
                {t('Cancel')}
              </Button>,
            ]
      }
    >
      <Form>
        <FormGroup label={t('Name')} isRequired fieldId="input-name">
          <TextInput
            id="input-name"
            data-test="input-name"
            name="name"
            type="text"
            onChange={(e, v) => setName(v)}
            value={name || ''}
            autoFocus
            required
          />
        </FormGroup>
        <FormGroup label={t('Display name')} fieldId="input-display-name">
          <TextInput
            id="input-display-name"
            name="displayName"
            type="text"
            onChange={(e, v) => setDisplayName(v)}
            value={displayName || ''}
          />
        </FormGroup>
        <FormGroup label={t('Description')} fieldId="input-description">
          <TextArea
            id="input-description"
            name="description"
            onChange={(e, v) => setDescription(v)}
            value={description || ''}
          />
        </FormGroup>
        {errorMessage && (
          <FormAlert>
            <Alert
              isInline
              variant="danger"
              title={t('An error occurred.')}
              data-test="alert-error"
            >
              {errorMessage}
            </Alert>
          </FormAlert>
        )}
      </Form>
    </Modal>
  );
};

export type CreateProjectModalProps = {
  close: () => void;
};

export default CreateProjectModal;
