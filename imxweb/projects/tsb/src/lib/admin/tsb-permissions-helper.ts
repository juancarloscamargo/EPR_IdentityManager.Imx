/*
 * ONE IDENTITY LLC. PROPRIETARY INFORMATION
 *
 * This software is confidential.  One Identity, LLC. or one of its affiliates or
 * subsidiaries, has supplied this software to you under terms of a
 * license agreement, nondisclosure agreement or both.
 *
 * You may not copy, disclose, or use this software except in accordance with
 * those terms.
 *
 *
 * Copyright 2023 One Identity LLC.
 * ALL RIGHTS RESERVED.
 *
 * ONE IDENTITY LLC. MAKES NO REPRESENTATIONS OR
 * WARRANTIES ABOUT THE SUITABILITY OF THE SOFTWARE,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
 * TO THE IMPLIED WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE, OR
 * NON-INFRINGEMENT.  ONE IDENTITY LLC. SHALL NOT BE
 * LIABLE FOR ANY DAMAGES SUFFERED BY LICENSEE
 * AS A RESULT OF USING, MODIFYING OR DISTRIBUTING
 * THIS SOFTWARE OR ITS DERIVATIVES.
 *
 */

export function isTsbNameSpaceAdminBase(groups: string[]): boolean {
  return groups.find(item => item.toUpperCase() === 'TSB_4_NAMESPACEADMIN_BASE') != null;
}

export function isAdminGAP(groups: string[]): boolean {
  return groups.find(item => item  === 'Portal_UI_GAP') != null;
}

export function esOperadorSD(groups: string[]): boolean {
  return groups.find(item => item.toUpperCase() === 'CCC_EPRINSA_PERMS_GAP') != null;

  
}

export function esAdminPersonas(groups:string[]): boolean {
  return groups.find(item=> item.toUpperCase() === 'VI_4_ALLMANAGER') != null;
}


export function esAdminEPR(features: string[]): boolean {
  return features.find((item) => item === 'Portal_UI_AdmEprinsa') != null;
}