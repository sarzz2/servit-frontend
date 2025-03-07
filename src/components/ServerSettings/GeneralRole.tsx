import React, { useEffect, useState } from 'react';
import { Server } from '../../types/server';
import { Role } from '../../types/role';
import clsx from 'clsx';

interface GeneralRoleProps {
  editRoleData: Role | null;
  handleChangeEditRoleData: (key: keyof Role, value: any) => void;
  handleDeleteModal: () => void;
}

const GeneralRole: React.FC<GeneralRoleProps> = ({
  editRoleData,
  handleChangeEditRoleData,
  handleDeleteModal,
}) => {
  const colors = [
    '#ff5733',
    '#33ff57',
    '#3357ff',
    '#f1c40f',
    '#8e44ad',
    '#ff33a1',
    '#33fff8',
    '#ff8c00',
    '#ffd700',
    '#ff1493',
    '#00ff7f',
    '#1e90ff',
    '#ff4500',
    '#adff2f',
    '#ff69b4',
    '#7b68ee',
  ];

  return (
    <div>
      <div className="flex gap-6 mb-4">
        <div className="mb-4 grow">
          <label className="block font-medium mb-2">Role Name</label>
          <input
            type="text"
            value={editRoleData?.name}
            onChange={(e) => handleChangeEditRoleData('name', e.target.value)}
            placeholder="Enter role name"
            className="w-full bg-bg-tertiary dark:bg-dark-tertiary p-3  outline-none rounded-lg"
            disabled={editRoleData?.name === '@everyone' ? true : false}
          />
        </div>
        <div className="mb-4 grow">
          <label className="block font-medium mb-2">Role Description</label>
          <input
            type="text"
            value={editRoleData?.description}
            onChange={(e) =>
              handleChangeEditRoleData('description', e.target.value)
            }
            placeholder="Enter role description"
            className="w-full bg-bg-tertiary dark:bg-dark-tertiary p-3 outline-none rounded-lg"
          />
        </div>
      </div>
      <div className="mb-8">
        <label className="block font-medium mb-2">Role Color</label>
        <div className="grid grid-cols-12  gap-2 grid-row-2 w-1/2">
          <div
            style={{ background: editRoleData?.color }}
            className={clsx(
              `row-span-2 col-span-2 bg-red-500 relative flex justify-center items-center rounded-sm`
            )}
          >
            <i className="fa fa-check text-4xl aboslute top-0 bottom-0 left-0 right-0"></i>
          </div>
          <label
            htmlFor="color-input"
            className="row-span-2 col-span-2 p-3 bg-transparent border border-white rounded-sm relative cursor-pointer"
          >
            <i className="fa fa-pencil text-white absolute top-2 right-2 "></i>
            <input
              type="color"
              id="color-input"
              className="invisible absolute"
              onChange={(e) =>
                handleChangeEditRoleData('color', e.target.value)
              }
            />
          </label>
          {colors.map((color) => (
            <div
              style={{ background: color }}
              className={clsx(`p-3 cursor-pointer rounded-sm`)}
              onClick={() => {
                handleChangeEditRoleData('color', color);
              }}
            ></div>
          ))}
        </div>
      </div>
      <div className="pt-4 text-white bg-zinc-500 p-3 rounded-md">
        <label htmlFor="deleteRole">
          Delete this <strong>Role</strong>
        </label>
        <p className="mb-4 clear-right">
          Once you delete a role, there is no going back. Please be certain.
        </p>
        <button
          className="bg-red-500 px-4 py-2 rounded-lg text-white font-bold"
          onClick={handleDeleteModal}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default GeneralRole;
