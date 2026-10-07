import React from 'react';
import vault1Img from '../assets/vaults/vault1.png';
import vault2Img from '../assets/vaults/vault2.png';
import vault3Img from '../assets/vaults/vault3.png';
import vault4Img from '../assets/vaults/vault4.png';
import vault5Img from '../assets/vaults/vault5.png';

const VAULT_IMAGES = {
  1: vault1Img,
  2: vault2Img,
  3: vault3Img,
  4: vault4Img,
  5: vault5Img
};

/**
 * VaultIllustration renders the authentic 2D pixel-art scene illustrations
 * for each of the 5 infiltration targets.
 */
export function VaultIllustration({ levelNumber, className = '' }) {
  const imgSrc = VAULT_IMAGES[levelNumber] || vault1Img;

  return (
    <div className={`vault-art-box ${className}`}>
      <img
        src={imgSrc}
        alt={`Vault ${levelNumber} Preview`}
        className="vault-art-thumb"
      />
    </div>
  );
}
