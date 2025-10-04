import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Impressum - develo.tech',
  description: 'Impressum und rechtliche Informationen von develo.tech',
};

export default function ImpressumPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Header />

      <main className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
            Impressum
          </h1>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 space-y-6">
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
                Angaben gemäß § 5 TMG
              </h2>
              <div className="space-y-2 text-gray-600 dark:text-gray-300">
                <p>Oscar Knabe</p>
                <p>Steinstraße 71</p>
                <p>52249 Eschweiler</p>
                <p>Deutschland</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
                Kontakt
              </h2>
              <div className="space-y-2 text-gray-600 dark:text-gray-300">
                <p>E-Mail: info@develo.tech</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
                Umsatzsteuer-ID
              </h2>
              <div className="text-gray-600 dark:text-gray-300">
                <p>Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG:</p>
                <p className="italic">Die UST-ID wird nachgereicht.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
                Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV
              </h2>
              <div className="space-y-2 text-gray-600 dark:text-gray-300">
                <p>Oscar Knabe</p>
                <p>Steinstraße 71</p>
                <p>52249 Eschweiler</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
                Haftungsausschluss
              </h2>

              <div className="space-y-4 text-gray-600 dark:text-gray-300">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    Haftung für Inhalte
                  </h3>
                  <p className="text-sm leading-relaxed">
                    Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    Haftung für Links
                  </h3>
                  <p className="text-sm leading-relaxed">
                    Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar. Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    Urheberrecht
                  </h3>
                  <p className="text-sm leading-relaxed">
                    Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet. Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte Dritter beachtet. Insbesondere werden Inhalte Dritter als solche gekennzeichnet. Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam werden, bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Inhalte umgehend entfernen.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}