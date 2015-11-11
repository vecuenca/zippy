from pyzotero import zotero
import os.path
dontwrite = ["accessDate", "collections", "dateAdded", "dateModified", 
"itemType", "key", "relations", "tags", "url", "version"]

def openlink(op):
	if op == "c":
		if os.path.isfile("liblink.dat"):
			file = open('liblink.dat', 'a')
		else:
			file = open('liblink.dat', 'w+')
		return file
	elif op == "r":
		file = open('liblink.dat', 'r')
		return file
	elif op == "w":
		file = open('liblink.dat', 'w')
		return file
		
def closelink(file):
	file.close()
	
def createlink(pkey, gkey):
	file = openlink("c")
	file.write(pkey + ";" + gkey + "\n")
	closelink(file)

def deletelink(pkey):
	file = openlink('r')
	lines = file.readlines()
	closelink(file)
	file = openlink('w')
	for line in lines:
		if (line.split(";")[0] != pkey) and (line.split(";")[1].strip("\n") != pkey):
			file.write(line)
	closelink(file)
	
def search(key, zot):
	for item in zot.items():
		if (item["data"]["key"] == key):
			return item
	
#To synch group to be the same as personal, synch = "personal"
def synchdata(pkey, gkey, synch, pzot, gzot):
	pitem = search(pkey, pzot)
	gitem = search(gkey, gzot)
	if (synch == "group"):
		synchloop(pitem['data'], gitem['data'])
		pzot.update_item(pitem)
	if (synch == "personal"):
		synchloop(gitem['data'], pitem['data'])
		gzot.update_item(gitem)
		
def synchtags(pkey, gkey, synch, pzot, gzot):
	pitem = search(pkey, pzot)
	gitem = search(gkey, gzot)
	if (synch == "group"):
		pitem['data']['tags'] = gitem['data']['tags']
		pzot.update_item(pitem)
	else:
		gitem['data']['tags'] = pitem['data']['tags']
		gzot.update_item(gitem)
	
		
def synchloop(list1, list2):
	if isinstance(list1, dict):
		for i in list1:
			if not i in dontwrite:
				if isinstance(list1[i], list):
					synchloop(list1[i], list2[i])
				else:
					list1[i] = list2[i]
	elif isinstance(list1, list):
		for i in range(0, len(list1)):
			if isinstance(list1[i], dict):
				synchloop(list1[i], list2[i])
			else:
				list1[i] = list2[i]
