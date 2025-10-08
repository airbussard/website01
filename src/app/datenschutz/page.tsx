import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Datenschutzerklärung - getemergence.com',
  description: 'Datenschutzerklärung und Informationen zum Datenschutz bei getemergence.com',
};

export default function DatenschutzPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />

      <main className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            Datenschutzerklärung
          </h1>

          <div className="bg-white rounded-xl shadow-lg p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                1. Datenschutz auf einen Blick
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Allgemeine Hinweise
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können. Ausführliche Informationen zum Thema Datenschutz entnehmen Sie unserer unter diesem Text aufgeführten Datenschutzerklärung.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Datenerfassung auf dieser Website
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-2">
                    <strong>Wer ist verantwortlich für die Datenerfassung auf dieser Website?</strong>
                  </p>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten können Sie dem Abschnitt „Hinweis zur Verantwortlichen Stelle" in dieser Datenschutzerklärung entnehmen.
                  </p>

                  <p className="text-gray-600 text-sm leading-relaxed mb-2">
                    <strong>Wie erfassen wir Ihre Daten?</strong>
                  </p>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Hierbei kann es sich z.B. um Daten handeln, die Sie in ein Kontaktformular eingeben. Andere Daten werden automatisch oder nach Ihrer Einwilligung beim Besuch der Website durch unsere IT-Systeme erfasst. Das sind vor allem technische Daten (z.B. Internetbrowser, Betriebssystem oder Uhrzeit des Seitenaufrufs). Die Erfassung dieser Daten erfolgt automatisch, sobald Sie diese Website betreten.
                  </p>

                  <p className="text-gray-600 text-sm leading-relaxed mb-2">
                    <strong>Wofür nutzen wir Ihre Daten?</strong>
                  </p>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    Ein Teil der Daten wird erhoben, um eine fehlerfreie Bereitstellung der Website zu gewährleisten. Andere Daten können zur Analyse Ihres Nutzerverhaltens verwendet werden.
                  </p>

                  <p className="text-gray-600 text-sm leading-relaxed mb-2">
                    <strong>Welche Rechte haben Sie bezüglich Ihrer Daten?</strong>
                  </p>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft, Empfänger und Zweck Ihrer gespeicherten personenbezogenen Daten zu erhalten. Sie haben außerdem ein Recht, die Berichtigung oder Löschung dieser Daten zu verlangen. Wenn Sie eine Einwilligung zur Datenverarbeitung erteilt haben, können Sie diese Einwilligung jederzeit für die Zukunft widerrufen. Außerdem haben Sie das Recht, unter bestimmten Umständen die Einschränkung der Verarbeitung Ihrer personenbezogenen Daten zu verlangen. Des Weiteren steht Ihnen ein Beschwerderecht bei der zuständigen Aufsichtsbehörde zu.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                2. Hosting
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                Wir hosten die Inhalte unserer Website bei folgendem Anbieter:
              </p>

              <div className="mt-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Externes Hosting
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Diese Website wird extern gehostet. Die personenbezogenen Daten, die auf dieser Website erfasst werden, werden auf den Servern des Hosters / der Hoster gespeichert. Hierbei kann es sich v.a. um IP-Adressen, Kontaktanfragen, Meta- und Kommunikationsdaten, Vertragsdaten, Kontaktdaten, Namen, Websitezugriffe und sonstige Daten, die über eine Website generiert werden, handeln.
                </p>
                <p className="text-gray-600 text-sm leading-relaxed mt-2">
                  Das externe Hosting erfolgt zum Zwecke der Vertragserfüllung gegenüber unseren potenziellen und bestehenden Kunden (Art. 6 Abs. 1 lit. b DSGVO) und im Interesse einer sicheren, schnellen und effizienten Bereitstellung unseres Online-Angebots durch einen professionellen Anbieter (Art. 6 Abs. 1 lit. f DSGVO).
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                3. Allgemeine Hinweise und Pflichtinformationen
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Datenschutz
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend den gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Hinweis zur verantwortlichen Stelle
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-2">
                    Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:
                  </p>
                  <div className="text-gray-600 text-sm space-y-1">
                    <p>Oscar Knabe</p>
                    <p>Steinstraße 71</p>
                    <p>52249 Eschweiler</p>
                    <p className="mt-2">E-Mail: hello@getemergence.com</p>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed mt-3">
                    Verantwortliche Stelle ist die natürliche oder juristische Person, die allein oder gemeinsam mit anderen über die Zwecke und Mittel der Verarbeitung von personenbezogenen Daten (z.B. Namen, E-Mail-Adressen o. Ä.) entscheidet.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Speicherdauer
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Soweit innerhalb dieser Datenschutzerklärung keine speziellere Speicherdauer genannt wurde, verbleiben Ihre personenbezogenen Daten bei uns, bis der Zweck für die Datenverarbeitung entfällt. Wenn Sie ein berechtigtes Löschungsverlangen geltend machen oder eine Einwilligung zur Datenverarbeitung widerrufen, werden Ihre Daten gelöscht, sofern wir keine anderen rechtlich zulässigen Gründe für die Speicherung Ihrer personenbezogenen Daten haben (z.B. steuer- oder handelsrechtliche Aufbewahrungsfristen); im letztgenannten Fall erfolgt die Löschung nach Fortfall dieser Gründe.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    SSL- bzw. TLS-Verschlüsselung
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Diese Seite nutzt aus Sicherheitsgründen und zum Schutz der Übertragung vertraulicher Inhalte, wie zum Beispiel Bestellungen oder Anfragen, die Sie an uns als Seitenbetreiber senden, eine SSL- bzw. TLS-Verschlüsselung. Eine verschlüsselte Verbindung erkennen Sie daran, dass die Adresszeile des Browsers von „http://" auf „https://" wechselt und an dem Schloss-Symbol in Ihrer Browserzeile.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                4. Datenerfassung auf dieser Website
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Kontaktformular
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus dem Anfrageformular inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage und für den Fall von Anschlussfragen bei uns gespeichert. Diese Daten geben wir nicht ohne Ihre Einwilligung weiter.
                  </p>
                  <p className="text-gray-600 text-sm leading-relaxed mt-2">
                    Die Verarbeitung dieser Daten erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO, sofern Ihre Anfrage mit der Erfüllung eines Vertrags zusammenhängt oder zur Durchführung vorvertraglicher Maßnahmen erforderlich ist. In allen übrigen Fällen beruht die Verarbeitung auf unserem berechtigten Interesse an der effektiven Bearbeitung der an uns gerichteten Anfragen (Art. 6 Abs. 1 lit. f DSGVO) oder auf Ihrer Einwilligung (Art. 6 Abs. 1 lit. a DSGVO) sofern diese abgefragt wurde.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Anfrage per E-Mail oder Telefon
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Wenn Sie uns per E-Mail oder Telefon kontaktieren, wird Ihre Anfrage inklusive aller daraus hervorgehenden personenbezogenen Daten (Name, Anfrage) zum Zwecke der Bearbeitung Ihres Anliegens bei uns gespeichert und verarbeitet. Diese Daten geben wir nicht ohne Ihre Einwilligung weiter.
                  </p>
                  <p className="text-gray-600 text-sm leading-relaxed mt-2">
                    Die Verarbeitung dieser Daten erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO, sofern Ihre Anfrage mit der Erfüllung eines Vertrags zusammenhängt oder zur Durchführung vorvertraglicher Maßnahmen erforderlich ist. In allen übrigen Fällen beruht die Verarbeitung auf unserem berechtigten Interesse an der effektiven Bearbeitung der an uns gerichteten Anfragen (Art. 6 Abs. 1 lit. f DSGVO) oder auf Ihrer Einwilligung (Art. 6 Abs. 1 lit. a DSGVO) sofern diese abgefragt wurde.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                5. Cookies
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Unsere Website verwendet Cookies. Cookies sind kleine Textdateien, die auf Ihrem Endgerät gespeichert werden und die Ihr Browser speichert. Sie richten keinen Schaden an.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Einige Cookies sind erforderlich, um die Funktionsfähigkeit unserer Website zu gewährleisten (essentielle Cookies). Andere Cookies helfen uns dabei, diese Website und Ihre Nutzererfahrung zu verbessern (analytische Cookies) oder ermöglichen es uns, Ihnen relevante Werbung anzuzeigen (Marketing-Cookies).
              </p>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Sie können Ihre Cookie-Einstellungen jederzeit anpassen. Weitere Informationen zu den von uns verwendeten Cookies und Ihren Wahlmöglichkeiten finden Sie in unserer{' '}
                <a href="/cookie-policy" className="text-primary-600 hover:underline">
                  Cookie-Richtlinie
                </a>
                .
              </p>

              <div className="mt-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Rechtsgrundlage
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Die Verwendung von essentiellen Cookies erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Funktionsfähigkeit der Website). Alle anderen Cookies werden nur nach Ihrer ausdrücklichen Einwilligung gemäß Art. 6 Abs. 1 lit. a DSGVO gesetzt.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                6. Verwendung von Supabase
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                Diese Website nutzt Supabase als Backend-Service für die Datenverwaltung und -speicherung. Supabase ist ein Open-Source-Backend-as-a-Service-Anbieter, der Datenbankfunktionalitäten, Authentifizierung und Echtzeit-Funktionen bereitstellt.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed mt-2">
                Wenn Sie unser Kontaktformular nutzen oder andere Interaktionen auf unserer Website durchführen, werden Ihre Daten möglicherweise über Supabase verarbeitet und gespeichert. Die Datenverarbeitung erfolgt auf Grundlage unseres berechtigten Interesses an einer effizienten und sicheren Bereitstellung unserer Website-Funktionalitäten (Art. 6 Abs. 1 lit. f DSGVO).
              </p>
              <p className="text-gray-600 text-sm leading-relaxed mt-2">
                Weitere Informationen zum Datenschutz bei Supabase finden Sie unter:{' '}
                <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                  https://supabase.com/privacy
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                7. Ihre Rechte
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Sie haben folgende Rechte hinsichtlich der Sie betreffenden personenbezogenen Daten:
              </p>
              <ul className="list-disc list-inside text-gray-600 text-sm space-y-1 ml-4">
                <li>Recht auf Auskunft</li>
                <li>Recht auf Berichtigung oder Löschung</li>
                <li>Recht auf Einschränkung der Verarbeitung</li>
                <li>Recht auf Widerspruch gegen die Verarbeitung</li>
                <li>Recht auf Datenübertragbarkeit</li>
              </ul>
              <p className="text-gray-600 text-sm leading-relaxed mt-4">
                Sie haben zudem das Recht, sich bei einer Datenschutz-Aufsichtsbehörde über die Verarbeitung Ihrer personenbezogenen Daten durch uns zu beschweren.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                8. Änderung unserer Datenschutzbestimmungen
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie stets den aktuellen rechtlichen Anforderungen entspricht oder um Änderungen unserer Leistungen in der Datenschutzerklärung umzusetzen, z.B. bei der Einführung neuer Services. Für Ihren erneuten Besuch gilt dann die neue Datenschutzerklärung.
              </p>
            </section>

            <section className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Stand: {new Date().toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}