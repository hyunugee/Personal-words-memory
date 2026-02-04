'use client';

import { ChangeEvent } from 'react';
import { Upload } from 'lucide-react';
import styles from './FileUpload.module.css';

interface FileUploadProps {
    onFileSelect: (file: File) => void;
    accept?: string;
}

export default function FileUpload({ onFileSelect, accept = "image/*,application/pdf" }: FileUploadProps) {
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onFileSelect(e.target.files[0]);
        }
    };

    return (
        <label className={styles.uploadBox}>
            <input
                type="file"
                accept={accept}
                onChange={handleChange}
                className={styles.hiddenInput}
            />
            <div className={styles.content}>
                <Upload size={32} className={styles.icon} />
                <span className={styles.text}>Upload Image or PDF</span>
            </div>
        </label>
    );
}
