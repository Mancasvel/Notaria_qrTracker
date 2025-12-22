'use client';

import { Modal } from './ui/Modal';
import { Button } from './ui/Button';

interface UbicacionOption {
  label: string;
  value: string;
}

interface UbicacionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (ubicacion: string) => void;
  role: string;
  documentNotario?: 'MAPE' | 'MCVF';
  isLoading?: boolean;
}

// Definir las opciones según el rol
const getOpcionesPorRol = (role: string, documentNotario?: 'MAPE' | 'MCVF'): UbicacionOption[] => {
  switch (role) {
    case 'oficial':
      return [
        { label: '📋 Matriz', value: 'MATRIZ' },
        { label: '📝 Diligencia', value: 'DILIGENCIA' },
      ];
    
    case 'copista':
      return [
        { label: '📤 1ª Presentación', value: '1_PRESENTACION' },
        { label: '📄 Copia', value: 'COPIA' },
        { label: '🏛️ Catastro', value: 'CATASTRO' },
        { label: '📥 2ª Presentación', value: '2_PRESENTACION' },
        { label: '📁 Archivo', value: 'ARCHIVO' },
        { label: '✍️ Firma', value: documentNotario ? `DESPACHO_${documentNotario}` : 'FIRMA' },
      ];
    
    case 'contabilidad':
      return [
        { label: '🧾 Factura', value: 'FACTURA' },
        { label: '📝 Pendiente en copia', value: 'PENDIENTE_COPIA' },
        { label: '✍️ Firma', value: documentNotario ? `DESPACHO_${documentNotario}` : 'FIRMA' },
        { label: '✍️ Devuelto a notario', value: documentNotario ? `DESPACHO_${documentNotario}` : 'DEVUELTO_A_NOTARIO' }
      ];
    
    default:
      return [];
  }
};

export function UbicacionModal({
  isOpen,
  onClose,
  onSelect,
  role,
  documentNotario,
  isLoading = false,
}: UbicacionModalProps) {
  const opciones = getOpcionesPorRol(role, documentNotario);

  const handleSelect = (value: string) => {
    onSelect(value);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Selecciona la ubicación del documento">
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground mb-4">
          ¿Dónde se encuentra o qué trámite está realizando con este documento?
        </p>
        
        <div className="grid gap-2">
          {opciones.map((opcion) => (
            <Button
              key={opcion.value}
              onClick={() => handleSelect(opcion.value)}
              variant="outline"
              className="w-full justify-start text-left h-auto py-3 px-4"
              disabled={isLoading}
            >
              <span className="text-base">{opcion.label}</span>
            </Button>
          ))}
        </div>

        <Button
          onClick={onClose}
          variant="ghost"
          className="w-full mt-4"
          disabled={isLoading}
        >
          Cancelar
        </Button>
      </div>
    </Modal>
  );
}
