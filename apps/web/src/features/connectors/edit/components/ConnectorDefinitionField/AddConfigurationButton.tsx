import { Button } from '@owox/ui/components/button';
import { Plus } from 'lucide-react';
import { DataMartConnectorView } from '../../DataMartConnectorView';
import { DataStorageType } from '../../../../data-storage';
import type { ConnectorConfig } from '../../../../data-marts/edit/model';

interface AddConfigurationButtonProps {
  storageType: DataStorageType;
  onAddConfiguration: (newConfig: Record<string, unknown>) => void;
  existingConnector?: ConnectorConfig;
}

export function AddConfigurationButton({
  storageType,
  onAddConfiguration,
  existingConnector,
}: AddConfigurationButtonProps) {
  return (
    <div>
      <DataMartConnectorView
        dataStorageType={storageType}
        onSubmit={(connector: ConnectorConfig) => {
          const newConfig = connector.source.configuration[0] || {};
          onAddConfiguration(newConfig);
        }}
        configurationOnly={true}
        existingConnector={existingConnector}
      >
        <Button
          type='button'
          variant='outline'
          className='hover:border-primary/50 flex h-12 w-full items-center justify-center gap-2 border-1 text-sm'
        >
          <Plus className='h-4 w-4' />
          <span>Add more configuration</span>
        </Button>
      </DataMartConnectorView>
    </div>
  );
}
