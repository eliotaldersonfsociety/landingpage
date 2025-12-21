// app/page.tsx
import { AlternatingContent } from './alternating-content';

export default function AlternatingContents() {
  return (
    <main>
      {/* Otros componentes */}
      
      {/* ✅ Wrapper externo */}
      <div>
        <AlternatingContent />
      </div>

      {/* Más componentes */}
    </main>
  )
}