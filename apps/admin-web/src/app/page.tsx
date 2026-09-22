'use client';

import { useState } from 'react';
import styles from './page.module.css';
import { Button, DataTable, OrderStatusBadge, Select, Sidebar, type OrderStatus } from '@dashroute/ui';

interface OrderRow extends Record<string, unknown> {
  id: string;
  order: string;
  driver: string;
  status: OrderStatus;
}

const ROWS: OrderRow[] = [
  { id: '1', order: '#02047A', driver: 'Camila Ríos', status: 'IN_TRANSIT' },
  { id: '2', order: '#02047B', driver: '—', status: 'PENDING' },
  { id: '3', order: '#02047C', driver: 'Julián Mora', status: 'DELIVERED' },
];

export default function Home() {
  const [current, setCurrent] = useState('orders');

  return (
    <div className={styles.shell}>
      <Sidebar
        current={current}
        onSelect={setCurrent}
        items={[
          { id: 'orders', label: 'Órdenes', icon: 'box' },
          { id: 'drivers', label: 'Conductores', icon: 'user' },
        ]}
      />
      <main className={styles.main}>
        <h1 className={styles.title}>Órdenes</h1>
        <div className={styles.toolbar}>
          <Select
            label="Estado"
            size="compact"
            placeholder="Todos"
            options={[
              { value: 'PENDING', label: 'Pendiente' },
              { value: 'IN_TRANSIT', label: 'En ruta' },
              { value: 'DELIVERED', label: 'Entregada' },
            ]}
          />
          <Button variant="primary" size="compact" auto>
            Crear orden
          </Button>
        </div>
        <DataTable<OrderRow>
          rowKey="id"
          columns={[
            { key: 'order', header: 'Orden', strong: true },
            { key: 'driver', header: 'Conductor' },
            { key: 'status', header: 'Estado', render: (row) => <OrderStatusBadge status={row.status} /> },
          ]}
          rows={ROWS}
        />
      </main>
    </div>
  );
}
