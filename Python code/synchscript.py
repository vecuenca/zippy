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
		if line.split(";")[0] != pkey:
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

#synchloop(pitem, gitem)
#gitem['data']['creators'] = {'creatorType': 'author', 'firstName': 'Daniel', 'lastName': 'Katz'}
#print gitem['data']['creators']
#synchdata("8A9ACPGR", "UIQP4DH5", "personal")
pzot = zotero.Zotero("2721501", "user", "OLjjhuLwrV9yXXhg3E2Vioo9")
gzot = zotero.Zotero("421041", "group", "OLjjhuLwrV9yXXhg3E2Vioo9")
print search("UIQP4DH5", gzot)
#synchitems("https://api.zotero.org/users/2721501/items/8A9ACPGR", "https://api.zotero.org/groups/421041/items/UIQP4DH5", "group")
#zotpersonal = zotero.Zotero("2721501", "user", "OLjjhuLwrV9yXXhg3E2Vioo9")
#zotgroup = zotero.Zotero("421041", "group", "OLjjhuLwrV9yXXhg3E2Vioo9")
#items = zotpersonal.top(limit=5)
# we've retrieved the latest five top-level items in our library
# we can print each item's item type and ID
#count = 0
#for item in items:
	#zotpersonal.item['data']['title'] = 'lmao changed'
	#createlink(item["data"]["key"], zotgroup.items()[count]["data"]["key"])
	#count += 1
	#createlink("sdfsdfsadf", "dsafadsf")
    #print('Item: %s | Key: %s') % (item['data']['itemType'], item['data']['key'])
    #updated = zot.add_tags(item, "tag", "tag666", "cherry")