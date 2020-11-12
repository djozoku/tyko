import { ListItemText, Menu, MenuItem, NoSsr } from '@material-ui/core';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import MaterialTable, { Action, Column, Query, QueryResult } from 'material-table';
import React, { useState } from 'react';

import { useMenu } from '../hooks/useMenu';
import { tableIcons } from '../lib/tableIcons';
import { TableRef } from '../lib/types';

interface TableData {
  id: string;
  [key: string]: any;
}

interface DataTableProps<T extends TableData> {
  title: string;
  emptyMsg: string;
  columns: Column<T>[];
  defaultSize?: number;
  data: (query: Query<T>) => Promise<QueryResult<T>>;
  onRowClick?: (event?: React.MouseEvent<Element, MouseEvent>, rowData?: T) => void;
  addRow?: () => void;
  menuItems?: MenuItem[];
  tableRef?: React.RefObject<TableRef>;
}

export type RowAction = (id: string) => void;

export interface DefaultMenuItems {
  editRow?: RowAction;
  deleteRow?: RowAction;
}

export interface MenuItem {
  text: string;
  icon: () => JSX.Element;
  action: RowAction;
}

export const defaultMenuItems = ({ editRow, deleteRow }: DefaultMenuItems = {}): MenuItem[] => {
  const menuItems: MenuItem[] = [];

  if (editRow) {
    menuItems.push({
      text: 'Muokkaa',
      icon: () => <tableIcons.Edit />,
      action: editRow,
    });
  }

  if (deleteRow) {
    menuItems.push({
      text: 'Poista',
      icon: () => <tableIcons.Delete />,
      action: deleteRow,
    });
  }

  return menuItems;
};

const DataTable = <T extends TableData>(props: DataTableProps<T>) => {
  const {
    title,
    emptyMsg,
    columns,
    data,
    onRowClick,
    addRow,
    tableRef,
    menuItems = [],
    defaultSize = 20,
  } = props;
  const { el, open, close } = useMenu();
  const [selected, setSelected] = useState('');

  const localization = {
    pagination: {
      labelDisplayedRows: '{from}-{to} / {count}',
      labelRowsSelect: 'riviä',
    },
    toolbar: {
      searchTooltip: 'Hae',
      searchPlaceholder: 'Hae',
    },
    header: {
      actions: '',
    },
    body: {
      emptyDataSourceMessage: emptyMsg,
    },
  };

  const actions: Action<T>[] = [];

  if (addRow) {
    actions.push({
      icon: () => <tableIcons.Add />,
      isFreeAction: true,
      onClick: addRow,
    });
  }

  const menu = menuItems.length > 0;

  if (menu) {
    actions.push({
      icon: () => <MoreVertIcon />,
      onClick: (e, data) => {
        open(e);
        setSelected((data as any).id);
      },
    });
  }

  const onClose = () => {
    setSelected('');
    close();
  };

  return (
    <NoSsr>
      <MaterialTable<T>
        title={title}
        icons={tableIcons as any}
        columns={columns}
        data={data}
        onRowClick={onRowClick}
        options={{
          pageSize: defaultSize,
          pageSizeOptions: [defaultSize],
          actionsColumnIndex: -1,
          draggable: false,
          search: false,
          sorting: false,
        }}
        localization={localization}
        actions={actions}
        tableRef={tableRef}
      />
      {menu && (
        <Menu id="row-menu" anchorEl={el} keepMounted open={!!el} onClose={onClose}>
          {menuItems.map((menuItem) => (
            <MenuItem
              onClick={() => {
                onClose();
                menuItem.action(selected);
              }}
              key={menuItem.text}
            >
              <ListItemText primary={menuItem.text} />
              <div style={{ width: '8px' }} />
              <menuItem.icon />
            </MenuItem>
          ))}
        </Menu>
      )}
    </NoSsr>
  );
};

export default DataTable;
