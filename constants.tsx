
import React from 'react';

export const COLORS = {
  JD_GREEN: '#367C2B',
  JD_YELLOW: '#FFDE00',
  JD_DARK: '#1D1D1D',
};

export const DEFAULT_PRODUCTS = [
  'Tractores Serie 6M / 6J',
  'Cosechadoras Serie S',
  'Pulverizadoras PLA by John Deere',
  'Sembradoras 1775NT',
  'Ecosistema Conectado / Operations Center',
  'Soluciones de Posventa / Repuestos',
  'John Deere Financial'
];

export const ROLES = [
  'Productor',
  'Asesor Agronómico',
  'Contratista',
  'Operario',
  'Estudiante',
  'Otro'
];

export const LOGO = (
  <svg viewBox="0 0 100 60" className="h-10 w-auto">
    <path d="M10,10 L90,10 L90,50 L10,50 Z" fill={COLORS.JD_GREEN} />
    <path d="M25,20 L35,20 L45,40 L55,20 L65,20 L50,50 L40,50 Z" fill={COLORS.JD_YELLOW} />
  </svg>
);
