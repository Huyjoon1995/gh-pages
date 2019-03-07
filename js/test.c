#include<linux/string.h>
#include<linux/module.h>
#include <linux/moduleparam.h>
#include<linux/kernel.h>
#include<linux/sched.h>
#include <linux/sched/signal.h>   
#include<linux/pid.h>
#include<linux/pid_namespace.h>
#include<asm/uaccess.h>
#include<linux/fs.h> 
#include <linux/slab.h>
#include<linux/cdev.h>
#include<linux/proc_fs.h>
#include<linux/init.h>
#include<linux/seq_file.h>
#include <linux/uaccess.h>



// Total # contiguous pages
static int totalContig = 0;
// Total # non contiguous pages 
static int totalNonContig = 0; 
static int size = 0;
// Pointer to the start of the linked list
// static list *start;

int procReport_init(void);
void procReport_exit(void);
static int traverse(void);
unsigned long virt2phys(unsigned long, struct mm_struct *);
// void printKernelLog();

char ** list;

// Prints to the Kernel log
// void printKernelLog() {
// 	// struct list *curr = head;
// 	printk(KERN_INFO "PROCESS REPORT:");
// 	printk(KERN_INFO "proc_id,proc_name,contig_pages,noncontig_pages,total_pages");
// 	int i;
// 	i = 0;
// 	while (i < size) {
// 		printk("%s\n", list[i++]);
// 	}	
// 	printk(KERN_INFO "TOTALS,,%d,%d,%d\n", totalContig, totalNonContig, totalContig+totalNonContig);
// 	// return 0;
// }
// Iterates through the process to gather info
static int traverse(void) {
	// struct list *head = NULL;
	struct vm_area_struct *vma = 0;
	struct task_struct *task;
	unsigned long vpage, curr;

	int contig_pages = 0; int noncontig_pages = 0;

	for_each_process(task) {
    	char * temp = vmalloc(sizeof(char) * 50);    	
        if (task->pid > 650) {
			if (task->mm && task->mm->mmap) { 
				for (vma = task->mm->mmap; vma; vma = vma->vm_next) { 
					curr = 0;
					for (vpage = vma->vm_start; vpage < vma->vm_end; vpage += PAGE_SIZE) {
				     	unsigned long phys = virt2phys(vpage, task->mm);
						if (phys != 0) {
							if (phys == curr + PAGE_SIZE) {
								contig_pages++;		
							} else {
								noncontig_pages++;
							}
							curr = phys;
						}					
					}
				}
				totalContig += contig_pages;
				totalNonContig += noncontig_pages;
				sprintf(temp, "%s, %d, %d, %d, %d", task->comm, task->pid, contig_pages, noncontig_pages, contig_pages + noncontig_pages);
				list[size++] = temp;
				contig_pages = noncontig_pages = 0;
			}
			
		}
	}
	// Pointer for printing the proc_reportstart = head;
	// printKernelLog();
	printk(KERN_INFO "PROCESS REPORT:");
	printk(KERN_INFO "proc_id,proc_name,contig_pages,noncontig_pages,total_pages");
	int i;
	i = 0;
	while (i < size) {
		printk("%s\n", list[i++]);
	}	
	printk(KERN_INFO "TOTALS,,%d,%d,%d\n", totalContig, totalNonContig, totalContig+totalNonContig);
	return 0;
}
unsigned long virt2phys(unsigned long vpage, struct mm_struct *mm) {
	pgd_t *pgd;
	p4d_t *p4d;
	pud_t *pud;
	pmd_t *pmd;
	pte_t *pte;
	struct page *page;
	unsigned long physical_page_addr = 0;
	pgd = pgd_offset(mm, vpage);
	if (pgd_none(*pgd) || pgd_bad(*pgd))
	   return 0;
	p4d = p4d_offset(pgd, vpage);
	if (p4d_none(*p4d) || p4d_bad(*p4d))
	   return 0;
	pud = pud_offset(p4d, vpage);
	if (pud_none(*pud) || pud_bad(*pud))
	   return 0;
	pmd = pmd_offset(pud, vpage); 
	if (pmd_none(*pmd) || pmd_bad(*pmd))
	   return 0;
	if (!(pte = pte_offset_map(pmd, vpage)))
	   return 0;
	if (!(page = pte_page(*pte)))
	   return 0;
	physical_page_addr = page_to_phys(page);
	pte_unmap(pte);

	return physical_page_addr; 
}
// Prints proc_report
static int proc_report_show(struct seq_file *m, void *v) {
  	
	seq_printf(m, "PROCESS REPORT:");
	seq_printf(m, "proc_id,proc_name,contig_pages,noncontig_pages,total_pages");
	int i;
	i = 0;
	while (i < size) {
		printk("%s\n", list[i++]);
	}
	seq_printf(m, "TOTALS,,%d,%d,%d\n", totalContig, totalNonContig, totalContig+totalNonContig);
  	return 0;
}

// Opens the proc_report
static int proc_report_open(struct inode *inode, struct  file *file) {
  return single_open(file, proc_report_show, NULL);
}
// Struct for creating proc_report
static struct file_operations proc_fops = {
    .read       = seq_read,
    .llseek     = seq_lseek,
    .release    = single_release,
    .owner      = THIS_MODULE,
    .open = proc_report_open
};

int procReport_init(void) {
	//iterate through the list
	list = vmalloc(sizeof(char *) * 100);
	traverse();
  	// Create proc_report
  	proc_create("proc_report",0,NULL,&proc_fops);

	return 0;
}
void procReport_exit(void) {
    remove_proc_entry("proc_report",NULL);
    
    // Free the list
    // while (start) {
    // 	struct list *node = start;
    // 	start = start->next;
    // 	kfree(node); 
    // }
}

MODULE_LICENSE("GPL");
module_init(procReport_init);
module_exit(procReport_exit);