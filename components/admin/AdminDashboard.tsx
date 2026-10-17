// import Link from "next/link";
// import { ArrowRight, FileSpreadsheet, Upload } from "lucide-react";
// import PageHeader from "@/components/shared/PageHeader";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { ROUTES, adminBatchRoute } from "@/lib/constants";
// import { listBatchSummaries } from "@/lib/orders/batchQueries";
// import { formatDateTime } from "@/lib/orders/formatters";
// import styles from "./AdminDashboard.module.css";

// /** Admin home: every uploaded sheet and a button to upload another. */
// export default async function AdminDashboard() {
//   const batches = await listBatchSummaries();

//   return (
//     <div className={`${styles.page} min-h-screen`}>
//       <main className="mx-auto max-w-5xl space-y-6 px-6 py-10">
//         <div className={styles.fadeUp}>
//           <PageHeader
//             title="Admin"
//             description="Your uploaded sheets."
//             backHref={ROUTES.home}
//             backLabel="Home"
//             actions={
//               <Link href={ROUTES.adminUpload} className={styles.uploadButton}>
//                 <Upload className={`${styles.uploadIcon} size-4`} aria-hidden="true" />
//                 Upload sheet
//               </Link>
//             }
//           />
//         </div>

//         {batches.length === 0 ? (
//           <section className={`${styles.fadeUp} ${styles.empty}`} style={{ animationDelay: "120ms" }}>
//             <span className={styles.emptyIcon}>
//               <FileSpreadsheet className="size-8" aria-hidden="true" />
//             </span>
//             <div className="space-y-1">
//               <h2 className="text-xl font-semibold">No sheets yet</h2>
//               <p className={`${styles.muted} text-sm`}>Upload your first .xlsx sheet to get started.</p>
//             </div>
//             <Link href={ROUTES.adminUpload} className={styles.uploadButton}>
//               <Upload className={`${styles.uploadIcon} size-4`} aria-hidden="true" />
//               Upload sheet
//             </Link>
//           </section>
//         ) : (
//           <section className={`${styles.fadeUp} ${styles.card}`} style={{ animationDelay: "120ms" }}>
//             <div className={styles.cardHeader}>
//               <h2 className="text-base font-semibold">All sheets</h2>
//               <span className={styles.countPill}>
//                 {batches.length} {batches.length === 1 ? "sheet" : "sheets"}
//               </span>
//             </div>

//             <Table>
//               <TableHeader>
//                 <TableRow className={`${styles.tableHead} hover:bg-transparent`}>
//                   <TableHead className="pl-5">Name</TableHead>
//                   <TableHead>File</TableHead>
//                   <TableHead className="text-right">Rows</TableHead>
//                   <TableHead>Uploaded</TableHead>
//                   <TableHead className="pr-5 text-right">
//                     <span className="sr-only">Open</span>
//                   </TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {batches.map((batch) => (
//                   <TableRow key={batch.id} className={styles.row}>
//                     <TableCell className="py-4 pl-5 font-medium">
//                       <span className="flex items-center gap-3">
//                         <span className={styles.fileIcon}>
//                           <FileSpreadsheet className="size-4" aria-hidden="true" />
//                         </span>
//                         {batch.name}
//                       </span>
//                     </TableCell>
//                     <TableCell className={styles.muted}>{batch.originalFileName}</TableCell>
//                     <TableCell className="text-right tabular-nums">
//                       <span className={styles.rowsBadge}>{batch.rowCount}</span>
//                     </TableCell>
//                     <TableCell className={styles.muted}>{formatDateTime(batch.createdAt)}</TableCell>
//                     <TableCell className="pr-5 text-right">
//                       <Link href={adminBatchRoute(batch.id)} className={styles.openLink}>
//                         Open
//                         <ArrowRight className={`${styles.arrow} size-3.5`} aria-hidden="true" />
//                       </Link>
//                     </TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           </section>
//         )}
//       </main>
//     </div>
//   );
// }






import Link from "next/link";
import { ArrowRight, FileSpreadsheet, KeyRound, Upload } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ROUTES, adminBatchRoute } from "@/lib/constants";
import { listBatchSummaries } from "@/lib/orders/batchQueries";
import { formatDateTime } from "@/lib/orders/formatters";
import styles from "./AdminDashboard.module.css";

/** Admin home: every uploaded sheet, plus shortcuts to upload and to manage access codes. */
export default async function AdminDashboard() {
  const batches = await listBatchSummaries();

  return (
    <div className={`${styles.page} min-h-screen`}>
      <main className="mx-auto max-w-5xl space-y-6 px-6 py-10">
        <div className={styles.fadeUp}>
          <PageHeader
            title="Admin"
            description="Your uploaded sheets."
            backHref={ROUTES.home}
            backLabel="Home"
            actions={
              <div className={styles.actions}>
                <Link href={ROUTES.adminAccessCodes} className={styles.secondaryButton}>
                  <KeyRound className="size-4" aria-hidden="true" />
                  Access codes
                </Link>
                <Link href={ROUTES.adminUpload} className={styles.uploadButton}>
                  <Upload className={`${styles.uploadIcon} size-4`} aria-hidden="true" />
                  Upload sheet
                </Link>
              </div>
            }
          />
        </div>

        {batches.length === 0 ? (
          <section className={`${styles.fadeUp} ${styles.empty}`} style={{ animationDelay: "120ms" }}>
            <span className={styles.emptyIcon}>
              <FileSpreadsheet className="size-8" aria-hidden="true" />
            </span>
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">No sheets yet</h2>
              <p className={`${styles.muted} text-sm`}>Upload your first .xlsx sheet to get started.</p>
            </div>
            <Link href={ROUTES.adminUpload} className={styles.uploadButton}>
              <Upload className={`${styles.uploadIcon} size-4`} aria-hidden="true" />
              Upload sheet
            </Link>
          </section>
        ) : (
          <section className={`${styles.fadeUp} ${styles.card}`} style={{ animationDelay: "120ms" }}>
            <div className={styles.cardHeader}>
              <h2 className="text-base font-semibold">All sheets</h2>
              <span className={styles.countPill}>
                {batches.length} {batches.length === 1 ? "sheet" : "sheets"}
              </span>
            </div>

            <Table>
              <TableHeader>
                <TableRow className={`${styles.tableHead} hover:bg-transparent`}>
                  <TableHead className="pl-5">Name</TableHead>
                  <TableHead>File</TableHead>
                  <TableHead className="text-right">Rows</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead className="pr-5 text-right">
                    <span className="sr-only">Open</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {batches.map((batch) => (
                  <TableRow key={batch.id} className={styles.row}>
                    <TableCell className="py-4 pl-5 font-medium">
                      <span className="flex items-center gap-3">
                        <span className={styles.fileIcon}>
                          <FileSpreadsheet className="size-4" aria-hidden="true" />
                        </span>
                        {batch.name}
                      </span>
                    </TableCell>
                    <TableCell className={styles.muted}>{batch.originalFileName}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      <span className={styles.rowsBadge}>{batch.rowCount}</span>
                    </TableCell>
                    <TableCell className={styles.muted}>{formatDateTime(batch.createdAt)}</TableCell>
                    <TableCell className="pr-5 text-right">
                      <Link href={adminBatchRoute(batch.id)} className={styles.openLink}>
                        Open
                        <ArrowRight className={`${styles.arrow} size-3.5`} aria-hidden="true" />
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </section>
        )}
      </main>
    </div>
  );
}