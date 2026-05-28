import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacidade | Bibliopatas',
  description:
    'Política de privacidade da Bibliopatas: catálogo de livros usados com valores, sem login de cliente e com contato via WhatsApp.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 rounded-3xl border border-border bg-card p-10 shadow-sm">
          <h1 className="text-4xl font-serif text-foreground mb-6">Política de Privacidade</h1>
          <p className="text-sm leading-7 text-muted-foreground">
            Na Bibliopatas, o respeito aos seus dados pessoais é prioridade. Esta política explica como coletamos, usamos e protegemos suas informações em conformidade com a Lei Geral de Proteção de Dados (LGPD).
          </p>
        </div>

        <section className="space-y-8">
          <article className="rounded-3xl border border-border bg-card p-8 shadow-sm">
            <h2 className="text-2xl font-serif text-primary mb-4">1. Natureza do site</h2>
            <p className="text-sm leading-7 text-muted-foreground">
              Este site é um catálogo de livros usados com valores e informações de venda. Não há login nem cadastro de usuário. O catálogo serve para mostrar os livros e os preços; a negociação acontece diretamente pelo WhatsApp.
            </p>
          </article>

          <article className="rounded-3xl border border-border bg-card p-8 shadow-sm">
            <h2 className="text-2xl font-serif text-primary mb-4">2. Dados pessoais</h2>
            <p className="text-sm leading-7 text-muted-foreground">
              Não coletamos dados pessoais de clientes apenas por visitar ou navegar no catálogo. Qualquer informação pessoal só é usada quando você decide entrar em contato voluntariamente pelo WhatsApp.
            </p>
          </article>

          <article className="rounded-3xl border border-border bg-card p-8 shadow-sm">
            <h2 className="text-2xl font-serif text-primary mb-4">3. Cookies e consentimento</h2>
            <p className="text-sm leading-7 text-muted-foreground">
              Usamos cookies apenas para salvar sua escolha de consentimento e para coletar estatísticas anônimas de navegação. Você pode recusar sem perder o acesso ao catálogo de livros.
            </p>
          </article>
        </section>
      </div>
    </div>
  )
}
