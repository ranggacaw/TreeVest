import AppShellLayout from '@/Layouts/AppShellLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { IconArrowLeft, IconCheck, IconX, IconInfoCircle, IconFlash } from '@/Components/Icons/AppIcons';
import BottomNav from '@/Components/Portfolio/BottomNav';
import { useState } from 'react';

interface Document {
    id: number;
    document_type: string;
    original_filename: string;
    file_size: number;
    uploaded_at: string;
}

interface Props {
    verification: {
        id: number;
        documents: Document[];
    };
}

export default function Upload({ verification }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        document_type: '',
        file: null as File | null,
    });

    const [dragActive, setDragActive] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.file || !data.document_type) return;

        router.post(route('kyc.store'), {
            ...data
        }, {
            forceFormData: true,
            onSuccess: () => {
                reset();
                router.reload();
            },
        });
    };

    const handleSubmitVerification = () => {
        router.post(route('kyc.submit'));
    };

    const documentTypes = [
        { value: 'national_id', label: 'KTP (Kartu Tanda Penduduk)' },
        { value: 'passport', label: 'Paspor (WNA / Internasional)' },
        { value: 'drivers_license', label: 'SIM (Surat Izin Mengemudi)' },
        { value: 'proof_of_address', label: 'Bukti Alamat (Tagihan/Invoice)' },
    ];

    return (
        <AppShellLayout>
            <Head title="Unggah Dokumen KYC" />

            <div className="relative w-full max-w-md bg-gray-50 flex flex-col min-h-screen">
                {/* Header */}
                <div className="bg-white px-4 py-4 flex items-center gap-4 sticky top-0 z-20 border-b border-gray-100">
                    <Link href={route('kyc.index')} className="p-2 -ml-2 text-gray-900">
                        <IconArrowLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="text-lg font-bold text-gray-900">Unggah Dokumen</h1>
                </div>

                <div className="flex-1 overflow-y-auto pb-40">
                    {/* Form Section */}
                    <div className="bg-white px-5 py-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                                    Jenis Dokumen
                                </label>
                                <select
                                    value={data.document_type}
                                    onChange={(e) => setData('document_type', e.target.value)}
                                    className="w-full bg-gray-50 border-gray-100 rounded-2xl py-3.5 px-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-emerald-500 transition-all border-2 focus:border-emerald-500"
                                >
                                    <option value="">Pilih jenis dokumen...</option>
                                    {documentTypes.map((type) => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.document_type && (
                                    <p className="mt-2 text-xs text-red-600 font-bold ml-1">{errors.document_type}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                                    File Dokumen
                                </label>
                                <div 
                                    className={`relative border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center transition-all ${dragActive ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 bg-gray-50'}`}
                                    onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                                    onDragLeave={() => setDragActive(false)}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        setDragActive(false);
                                        if (e.dataTransfer.files?.[0]) {
                                            setData('file', e.dataTransfer.files[0]);
                                        }
                                    }}
                                >
                                    <input 
                                        type="file" 
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={(e) => setData('file', e.target.files?.[0] || null)}
                                        accept=".jpg,.jpeg,.png,.pdf"
                                    />
                                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm mb-3">
                                        <IconFlash className="w-6 h-6 text-emerald-600 rotate-12" />
                                    </div>
                                    <p className="text-sm font-bold text-gray-900 mb-1">
                                        {data.file ? data.file.name : 'Ketuk atau seret file'}
                                    </p>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black">
                                        {data.file ? `${(data.file.size / 1024 / 1024).toFixed(2)} MB` : 'JPG, PNG, PDF (MAX 10MB)'}
                                    </p>
                                </div>
                                {errors.file && (
                                    <p className="mt-2 text-xs text-red-600 font-bold ml-1">{errors.file}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={processing || !data.file || !data.document_type}
                                className="w-full py-4 bg-gray-900 text-white font-black text-sm rounded-2xl flex items-center justify-center active:scale-95 transition-all disabled:opacity-30"
                            >
                                {processing ? 'Sedang Mengunggah...' : 'Unggah Dokumen'}
                            </button>
                        </form>
                    </div>

                    <div className="h-3 bg-gray-50" />

                    {/* Uploaded List */}
                    <div className="bg-white px-5 py-6">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 ml-1">Dokumen Terunggah</h3>
                        
                        {verification.documents.length > 0 ? (
                            <div className="space-y-3">
                                {verification.documents.map((doc) => (
                                    <div key={doc.id} className="flex items-center gap-4 p-4 border border-gray-100 rounded-3xl bg-white shadow-sm">
                                        <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                                            <IconCheck className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-bold text-gray-900 truncate">
                                                {doc.document_type.replace('_', ' ').toUpperCase()}
                                            </h4>
                                            <p className="text-[10px] text-gray-400 font-medium truncate">{doc.original_filename}</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-[10px] font-bold text-gray-900">{doc.file_size.toFixed(2)} MB</p>
                                            <p className="text-[9px] text-gray-400 font-medium">{new Date(doc.uploaded_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                                <p className="text-xs text-gray-400 font-medium">Belum ada dokumen yang diunggah.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Final Submit Action */}
                <div className="absolute bottom-0 left-0 right-0 p-5 bg-white border-t border-gray-100 flex flex-col gap-3 pb-8 z-30 shadow-2xl">
                    <button
                        onClick={handleSubmitVerification}
                        disabled={verification.documents.length === 0 || processing}
                        className="w-full py-4 bg-emerald-600 text-white font-black text-sm rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200 active:scale-95 transition-all disabled:opacity-50"
                    >
                        Ajukan Sekarang
                    </button>
                    <p className="text-[10px] text-gray-400 text-center font-medium">
                        Mohon pastikan semua dokumen yang diperlukan telah diunggah.
                    </p>
                </div>
                
                <BottomNav activeTab="profile" />
            </div>

            <style>{`
                ::-webkit-scrollbar { display: none; }
                * { -webkit-tap-highlight-color: transparent; }
            `}</style>
        </AppShellLayout>
    );
}
