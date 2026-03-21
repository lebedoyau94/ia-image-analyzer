import { ChangeEvent, useMemo, useState } from 'react';
import { analyzeImage, ImageTag } from './services/api';

export default function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [results, setResults] = useState<ImageTag[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  const imagePreviewUrl = useMemo(() => {
    if (!selectedFile) {
      return '';
    }
    return URL.createObjectURL(selectedFile);
  }, [selectedFile]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    setResults([]);
    setErrorMessage('');
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setErrorMessage('Selecciona una imagen antes de analizar.');
      return;
    }

    try {
      setIsUploading(true);
      setErrorMessage('');
      const tags = await analyzeImage(selectedFile);
      setResults(tags);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'No fue posible analizar la imagen.';
      setErrorMessage(message);
      setResults([]);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold">Analizador Inteligente de Imágenes</h1>
          <p className="text-sm text-slate-300">
            Carga una imagen para detectar etiquetas y confianza desde el backend.
          </p>
        </header>

        <section className="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-lg">
          <label
            htmlFor="image-upload"
            className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-700 px-6 py-10 text-center transition hover:border-sky-500"
          >
            <span className="text-base font-semibold">Area de carga de imagen</span>
            <span className="mt-2 text-sm text-slate-400">
              Formatos permitidos: JPG, PNG, WEBP (max 5MB)
            </span>
            <input
              id="image-upload"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>

          <div className="mt-4 flex items-center justify-between gap-4">
            <p className="truncate text-sm text-slate-300">
              {selectedFile ? `Archivo: ${selectedFile.name}` : 'Ningun archivo seleccionado.'}
            </p>
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={isUploading}
              className="rounded-md bg-sky-500 px-5 py-2 font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isUploading ? 'Analizando...' : 'Analizar'}
            </button>
          </div>
        </section>

        {imagePreviewUrl && (
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <img
              src={imagePreviewUrl}
              alt="Vista previa de la imagen seleccionada"
              className="max-h-80 w-full rounded-lg object-contain"
            />
          </section>
        )}

        {errorMessage && (
          <section className="rounded-lg border border-rose-700 bg-rose-950/40 p-4 text-sm text-rose-200">
            {errorMessage}
          </section>
        )}

        <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="mb-4 text-xl font-semibold">Resultados</h2>
          {results.length === 0 ? (
            <p className="text-sm text-slate-400">
              Aun no hay etiquetas. Sube una imagen y presiona Analizar.
            </p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {results.map((tag) => (
                <li
                  key={`${tag.label}-${tag.confidence}`}
                  className="rounded-lg border border-slate-700 bg-slate-800 p-4"
                >
                  <p className="text-base font-medium capitalize">{tag.label}</p>
                  <p className="mt-1 text-sm text-slate-300">
                    Confianza: {(tag.confidence * 100).toFixed(1)}%
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
